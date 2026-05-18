'use client';

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Icon, type IconName } from '@vxture/design-system';
import { changeUserPassword, fetchUserProfile, updateUserProfile } from '@/api/console-bff';
import { Avatar, Badge, Button, Input, Label, NativeSelect, Textarea } from '@vxture/design-system';
import type { ConsoleUserProfile } from '@/entities/console';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { useLocale, useTranslations } from 'next-intl';
import { ActionButton } from '@/modules/shared/ActionButton';
import { PageHeader } from '@/modules/shared/PageHeader';

type Feedback = { tone: 'success' | 'error'; key: string; values?: Record<string, number | string> } | null;
type ProfileField = {
  icon: IconName;
  label: string;
  value: string;
  title?: string;
  multiline?: boolean;
};
type ConnectedAccountProvider = 'wechat' | 'dingtalk' | 'feishu' | 'google';
type ConnectedAccountRecord = {
  provider: ConnectedAccountProvider;
  connected: boolean;
  accountName: string | null;
  accountId: string | null;
  connectedAt: string | null;
  lastUsedAt: string | null;
  enabled: boolean;
};

const DEFAULT_PROFILE_AVATAR_ONLINE_SRC = '/assets/icon/avatar-default-online.png';
const CONNECTED_ACCOUNTS_STORAGE_PREFIX = 'vxture.console.connectedAccounts';
const DEFAULT_CONNECTED_ACCOUNTS: ConnectedAccountRecord[] = [
  {
    provider: 'wechat',
    connected: false,
    accountName: null,
    accountId: null,
    connectedAt: null,
    lastUsedAt: null,
    enabled: true,
  },
  {
    provider: 'dingtalk',
    connected: false,
    accountName: null,
    accountId: null,
    connectedAt: null,
    lastUsedAt: null,
    enabled: true,
  },
  {
    provider: 'feishu',
    connected: false,
    accountName: null,
    accountId: null,
    connectedAt: null,
    lastUsedAt: null,
    enabled: true,
  },
  {
    provider: 'google',
    connected: false,
    accountName: null,
    accountId: null,
    connectedAt: null,
    lastUsedAt: null,
    enabled: true,
  },
];

function normalizeOptional(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function avatarUrl(value?: string | null) {
  return value?.trim() || DEFAULT_PROFILE_AVATAR_ONLINE_SRC;
}

function avatarStyle(value?: string | null): CSSProperties {
  return { backgroundImage: `url(${JSON.stringify(avatarUrl(value))})` };
}

function displayValue(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function formatProfileDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function connectedAccountsStorageKey(accountId?: string | null) {
  return `${CONNECTED_ACCOUNTS_STORAGE_PREFIX}:${accountId || 'anonymous'}`;
}

function providerMark(provider: ConnectedAccountProvider) {
  switch (provider) {
    case 'wechat':
      return 'WX';
    case 'dingtalk':
      return 'DT';
    case 'feishu':
      return 'FS';
    case 'google':
      return 'G';
    default:
      return '';
  }
}

function maskConnectedAccountId(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.length <= 8) {
    return value;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function ProfilePage() {
  const t = useTranslations('profilePage');
  const locale = useLocale();
  const { session, refreshSession } = useConsoleSession();
  const [profile, setProfile] = useState<ConsoleUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [unbindTarget, setUnbindTarget] = useState<ConnectedAccountRecord | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccountRecord[]>(DEFAULT_CONNECTED_ACCOUNTS);

  const [profileForm, setProfileForm] = useState({
    displayName: '',
    avatarUrl: '',
    headline: '',
    bio: '',
  });
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    timezone: '',
    language: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    nextPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let active = true;

    setLoading(true);
    void fetchUserProfile()
      .then((data) => {
        if (!active) {
          return;
        }

        if (data) {
          setProfile(data);
          setFeedback(null);
          return;
        }

        if (session.user) {
          setProfile({
            id: session.user.id,
            username: session.user.username ?? session.user.name,
            displayName: session.user.displayName ?? session.user.name,
            avatarUrl: null,
            headline: null,
            bio: null,
            email: session.user.email ?? null,
            phone: session.user.phone ?? null,
            timezone: null,
            language: null,
            profileUpdatedAt: null,
          });
          setFeedback(null);
          return;
        }

        setProfile(null);
        setFeedback({ tone: 'error', key: 'feedback.noProfile' });
      })
      .catch(() => {
        if (active) {
          setFeedback({ tone: 'error', key: 'feedback.loadError' });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session.user]);

  useEffect(() => {
    if (!profile?.id) {
      setConnectedAccounts(DEFAULT_CONNECTED_ACCOUNTS);
      return;
    }

    try {
      const stored = window.localStorage.getItem(connectedAccountsStorageKey(profile.id));
      if (!stored) {
        setConnectedAccounts(DEFAULT_CONNECTED_ACCOUNTS);
        return;
      }

      const parsed = JSON.parse(stored) as ConnectedAccountRecord[];
      const byProvider = new Map(parsed.map((account) => [account.provider, account]));
      setConnectedAccounts(
        DEFAULT_CONNECTED_ACCOUNTS.map((account) => ({
          ...account,
          ...byProvider.get(account.provider),
        })),
      );
    } catch {
      setConnectedAccounts(DEFAULT_CONNECTED_ACCOUNTS);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    window.localStorage.setItem(connectedAccountsStorageKey(profile.id), JSON.stringify(connectedAccounts));
  }, [connectedAccounts, profile?.id]);

  function resetFeedback() {
    setFeedback(null);
  }

  function languageLabel(value: string | null | undefined) {
    if (!value) {
      return t('common.empty');
    }

    if (value === 'zh-CN') {
      return t('language.zhCN');
    }

    if (value === 'en-US') {
      return t('language.enUS');
    }

    return value;
  }

  function openProfileDialog() {
    if (!profile) {
      return;
    }

    setProfileForm({
      displayName: profile.displayName ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      headline: profile.headline ?? '',
      bio: profile.bio ?? '',
    });
    setProfileDialogOpen(true);
    resetFeedback();
  }

  function openContactDialog() {
    if (!profile) {
      return;
    }

    setContactForm({
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      timezone: profile.timezone ?? '',
      language: profile.language ?? '',
    });
    setContactDialogOpen(true);
    resetFeedback();
  }

  function openPasswordDialog() {
    setPasswordForm({
      currentPassword: '',
      nextPassword: '',
      confirmPassword: '',
    });
    setPasswordDialogOpen(true);
    resetFeedback();
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      const updated = await updateUserProfile({
        displayName: normalizeOptional(profileForm.displayName),
        avatarUrl: normalizeOptional(profileForm.avatarUrl),
        headline: normalizeOptional(profileForm.headline),
        bio: normalizeOptional(profileForm.bio),
      });
      setProfile(updated);
      setProfileDialogOpen(false);
      setFeedback({ tone: 'success', key: 'feedback.profileSaved' });
      await refreshSession();
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.profileSaveError' });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      const updated = await updateUserProfile({
        email: normalizeOptional(contactForm.email),
        phone: normalizeOptional(contactForm.phone),
        timezone: normalizeOptional(contactForm.timezone),
        language: normalizeOptional(contactForm.language),
      });
      setProfile(updated);
      setContactDialogOpen(false);
      setFeedback({ tone: 'success', key: 'feedback.contactSaved' });
      await refreshSession();
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.contactSaveError' });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();

    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      setFeedback({ tone: 'error', key: 'feedback.passwordMismatch' });
      return;
    }

    if (passwordForm.nextPassword.length < 6) {
      setFeedback({ tone: 'error', key: 'feedback.passwordTooShort' });
      return;
    }

    setSubmitting(true);

    try {
      await changeUserPassword({
        currentPassword: passwordForm.currentPassword,
        nextPassword: passwordForm.nextPassword,
      });
      setPasswordDialogOpen(false);
      setFeedback({ tone: 'success', key: 'feedback.passwordSaved' });
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.passwordSaveError' });
    } finally {
      setSubmitting(false);
    }
  }

  async function clearAvatar() {
    if (!profile?.avatarUrl) {
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      const updated = await updateUserProfile({ avatarUrl: null });
      setProfile(updated);
      setFeedback({ tone: 'success', key: 'feedback.avatarCleared' });
      await refreshSession();
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.avatarClearError' });
    } finally {
      setSubmitting(false);
    }
  }

  function bindConnectedAccount(provider: ConnectedAccountProvider) {
    const now = new Date().toISOString();
    setConnectedAccounts((current) =>
      current.map((account) =>
        account.provider === provider
          ? {
              ...account,
              connected: true,
              accountName: displayName,
              accountId: `${provider}_${(username || 'user').replace(/[^\w.-]/g, '_')}`,
              connectedAt: now,
              lastUsedAt: now,
            }
          : account,
      ),
    );
    setFeedback({ tone: 'success', key: 'feedback.connectedAccountBound', values: { provider: t(`connectedAccounts.providers.${provider}.name`) } });
  }

  function openUnbindConnectedAccount(account: ConnectedAccountRecord) {
    setUnbindTarget(account);
    resetFeedback();
  }

  function confirmUnbindConnectedAccount() {
    if (!unbindTarget) {
      return;
    }

    setConnectedAccounts((current) =>
      current.map((account) =>
        account.provider === unbindTarget.provider
          ? {
              ...account,
              connected: false,
              accountName: null,
              accountId: null,
              connectedAt: null,
              lastUsedAt: null,
            }
          : account,
      ),
    );
    setFeedback({
      tone: 'success',
      key: 'feedback.connectedAccountUnbound',
      values: { provider: t(`connectedAccounts.providers.${unbindTarget.provider}.name`) },
    });
    setUnbindTarget(null);
  }

  const empty = t('common.empty');
  const loadingText = t('common.loading');
  const displayName = displayValue(profile?.displayName, profile?.username || session.user?.name || empty);
  const username = displayValue(profile?.username, session.user?.username ?? empty);
  const roleLabel = session.user?.roleLabel || t('summary.defaultRole');
  const headline = displayValue(profile?.headline, empty);
  const bio = displayValue(profile?.bio, empty);
  const email = displayValue(profile?.email, empty);
  const phone = displayValue(profile?.phone, empty);
  const timezone = displayValue(profile?.timezone, empty);
  const language = languageLabel(profile?.language);
  const updatedAt = formatProfileDate(profile?.profileUpdatedAt, locale, empty);
  const avatarStatus = profile?.avatarUrl ? t('summary.customAvatar') : t('summary.defaultAvatar');
  const previewName = displayValue(profileForm.displayName, username);
  const previewAvatar = profileForm.avatarUrl || profile?.avatarUrl;
  const connectedAccountCount = connectedAccounts.filter((account) => account.connected).length;

  const identityFields: ProfileField[] = [
    { icon: 'user', label: t('fields.displayName'), value: loading ? loadingText : displayName },
    { icon: 'key', label: t('fields.username'), value: loading ? loadingText : username },
    { icon: 'medal', label: t('fields.headline'), value: loading ? loadingText : headline },
    { icon: 'chat-circle', label: t('fields.bio'), value: loading ? loadingText : bio, multiline: true },
  ];

  const contactFields: ProfileField[] = [
    { icon: 'mail', label: t('fields.email'), value: loading ? loadingText : email },
    { icon: 'phone', label: t('fields.phone'), value: loading ? loadingText : phone },
    { icon: 'clock', label: t('fields.timezone'), value: loading ? loadingText : timezone },
    { icon: 'globe', label: t('fields.language'), value: loading ? loadingText : language },
  ];

  const securityFields: ProfileField[] = [
    { icon: 'shield-check', label: t('fields.password'), value: t('security.passwordSet') },
    { icon: 'clock', label: t('fields.updatedAt'), value: loading ? loadingText : updatedAt },
  ];

  function renderField(field: ProfileField) {
    return (
      <div
        key={field.label}
        className={field.multiline ? 'vx-account-profile-field vx-account-profile-field--multiline' : 'vx-account-profile-field'}
        title={`${field.label}: ${field.value}`}
      >
        <span className="vx-account-profile-field__icon" aria-hidden="true">
          <Icon name={field.icon} size="xs" fallback="placeholder" />
        </span>
        <span className="vx-account-profile-field__label">{field.label}</span>
        <strong className={field.value === empty ? 'vx-account-profile-field__value vx-account-profile-field__value--empty' : 'vx-account-profile-field__value'}>
          {field.value}
        </strong>
      </div>
    );
  }

  return (
    <div className="vx-page-stack vx-profile-page vx-account-profile-page">
      <PageHeader eyebrow={t('header.eyebrow')} title={t('header.title')} description={t('header.description')} />

      {feedback ? (
        <p className={feedback.tone === 'success' ? 'vx-profile-message' : 'vx-profile-error'}>
          {t(feedback.key, feedback.values)}
        </p>
      ) : null}

      <div className="vx-account-profile-layout">
        <aside className="vx-account-profile-identity">
          <section className="vx-account-profile-avatar-card">
            <Button
              variant="ghost"
              size="icon"
              className="vx-account-profile-avatar-button"
              aria-label={t('avatar.edit')}
              title={t('avatar.edit')}
              onClick={openProfileDialog}
              disabled={!profile}
            >
              <Avatar className="vx-account-profile-avatar" role="img" aria-label={t('avatar.alt', { name: displayName })} style={avatarStyle(profile?.avatarUrl)}>
                <span className="vx-account-profile-avatar__label">{displayName}</span>
              </Avatar>
              <span className="vx-account-profile-avatar-button__edit" aria-hidden="true">
                <Icon name="edit" size="xs" fallback="placeholder" />
              </span>
            </Button>

            <div className="vx-account-profile-avatar-card__copy">
              <strong>{loading ? loadingText : displayName}</strong>
              <span>{username}</span>
              <Badge className="vx-account-profile-avatar-card__badge">{roleLabel}</Badge>
            </div>

            <div className="vx-account-profile-avatar-card__actions">
              <ActionButton icon="edit" size="sm" onClick={openProfileDialog} disabled={!profile}>
                {t('actions.editProfile')}
              </ActionButton>
              <ActionButton variant="outline" icon="x" size="sm" onClick={() => void clearAvatar()} disabled={submitting || !profile?.avatarUrl}>
                {t('actions.clearAvatar')}
              </ActionButton>
            </div>
          </section>

          <section className="vx-account-profile-summary">
            <div className="vx-account-profile-summary__row">
              <span>{t('summary.avatar')}</span>
              <strong>{avatarStatus}</strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t('summary.email')}</span>
              <strong title={email}>{email}</strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t('summary.phone')}</span>
              <strong title={phone}>{phone}</strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t('summary.updatedAt')}</span>
              <strong title={updatedAt}>{updatedAt}</strong>
            </div>
          </section>
        </aside>

        <main className="vx-account-profile-main">
          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t('sections.profile.title')}</h2>
                <p>{t('sections.profile.description')}</p>
              </div>
              <ActionButton variant="outline" icon="edit" onClick={openProfileDialog} disabled={!profile}>
                {t('actions.edit')}
              </ActionButton>
            </header>
            <div className="vx-account-profile-field-list">{identityFields.map(renderField)}</div>
          </section>

          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t('sections.contact.title')}</h2>
                <p>{t('sections.contact.description')}</p>
              </div>
              <ActionButton variant="outline" icon="edit" onClick={openContactDialog} disabled={!profile}>
                {t('actions.edit')}
              </ActionButton>
            </header>
            <div className="vx-account-profile-field-list">{contactFields.map(renderField)}</div>
          </section>

          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t('sections.security.title')}</h2>
                <p>{t('sections.security.description')}</p>
              </div>
              <ActionButton variant="outline" icon="shield-check" onClick={openPasswordDialog}>
                {t('actions.changePassword')}
              </ActionButton>
            </header>
            <div className="vx-account-profile-field-list">{securityFields.map(renderField)}</div>
          </section>

          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t('sections.connectedAccounts.title')}</h2>
                <p>{t('sections.connectedAccounts.description')}</p>
              </div>
              <span className="vx-account-connected-summary">
                {t('connectedAccounts.summary', { count: connectedAccountCount, total: connectedAccounts.length })}
              </span>
            </header>

            <div className="vx-account-connected-list">
              {connectedAccounts.map((account) => {
                const providerName = t(`connectedAccounts.providers.${account.provider}.name`);
                const providerDescription = t(`connectedAccounts.providers.${account.provider}.description`);
                const accountId = maskConnectedAccountId(account.accountId) || empty;
                const connectedAt = formatProfileDate(account.connectedAt, locale, empty);
                const statusLabel = account.connected ? t('connectedAccounts.status.connected') : t('connectedAccounts.status.disconnected');

                return (
                  <div
                    key={account.provider}
                    className={
                      account.connected
                        ? 'vx-account-connected-row vx-account-connected-row--connected'
                        : 'vx-account-connected-row'
                    }
                    title={`${providerName}: ${statusLabel}`}
                  >
                    <span className={`vx-account-connected-logo vx-account-connected-logo--${account.provider}`} aria-hidden="true">
                      {account.provider === 'wechat' ? <Icon name="wechat" size="xs" fallback="placeholder" /> : providerMark(account.provider)}
                    </span>
                    <div className="vx-account-connected-copy">
                      <div className="vx-account-connected-copy__title">
                        <strong>{providerName}</strong>
                        <span>{statusLabel}</span>
                      </div>
                      <p>{providerDescription}</p>
                    </div>
                    <div className="vx-account-connected-meta">
                      <span>{t('connectedAccounts.fields.account')}</span>
                      <strong title={account.accountName || accountId}>{account.connected ? account.accountName || accountId : empty}</strong>
                    </div>
                    <div className="vx-account-connected-meta">
                      <span>{t('connectedAccounts.fields.connectedAt')}</span>
                      <strong title={connectedAt}>{connectedAt}</strong>
                    </div>
                    <div className="vx-account-connected-actions">
                      {account.connected ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => bindConnectedAccount(account.provider)}>
                            {t('connectedAccounts.actions.rebind')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openUnbindConnectedAccount(account)}>
                            {t('connectedAccounts.actions.unbind')}
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => bindConnectedAccount(account.provider)} disabled={!account.enabled}>
                          {account.enabled ? t('connectedAccounts.actions.bind') : t('connectedAccounts.status.unavailable')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {profileDialogOpen ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('dialogs.profile.title')}>
          <div className="vx-profile-dialog__backdrop" onClick={() => setProfileDialogOpen(false)} />
          <form className="vx-profile-dialog__content vx-account-profile-dialog vx-account-profile-dialog--wide" onSubmit={(event) => void submitProfile(event)}>
            <header className="vx-account-profile-dialog__header">
              <h3>{t('dialogs.profile.title')}</h3>
              <p>{t('dialogs.profile.description')}</p>
            </header>

            <div className="vx-account-profile-dialog-grid">
              <div className="vx-account-avatar-editor">
                <Avatar className="vx-account-avatar-editor__preview" role="img" aria-label={t('avatar.previewAlt', { name: previewName })} style={avatarStyle(previewAvatar)}>
                  <span className="vx-account-profile-avatar__label">{previewName}</span>
                </Avatar>
                <div>
                  <strong>{previewName}</strong>
                  <span>{profileForm.avatarUrl ? t('avatar.customPreview') : t('avatar.defaultPreview')}</span>
                </div>
              </div>

              <div className="vx-account-profile-form-grid">
                <Label>
                  {t('fields.displayName')}
                  <Input
                    value={profileForm.displayName}
                    onChange={(event) => setProfileForm((old) => ({ ...old, displayName: event.target.value }))}
                    autoComplete="name"
                  />
                </Label>
                <Label className="vx-account-profile-form-grid__wide">
                  {t('fields.avatarUrl')}
                  <div className="vx-account-profile-input-row">
                    <Input
                      value={profileForm.avatarUrl}
                      onChange={(event) => setProfileForm((old) => ({ ...old, avatarUrl: event.target.value }))}
                      placeholder={t('placeholders.avatarUrl')}
                      autoComplete="url"
                    />
                    <Button variant="outline" onClick={() => setProfileForm((old) => ({ ...old, avatarUrl: '' }))}>
                      {t('actions.clear')}
                    </Button>
                  </div>
                </Label>
                <Label className="vx-account-profile-form-grid__wide">
                  {t('fields.headline')}
                  <Input
                    value={profileForm.headline}
                    onChange={(event) => setProfileForm((old) => ({ ...old, headline: event.target.value }))}
                    placeholder={t('placeholders.headline')}
                  />
                </Label>
                <Label className="vx-account-profile-form-grid__wide">
                  {t('fields.bio')}
                  <Textarea
                    className="vx-profile-dialog__textarea"
                    rows={4}
                    value={profileForm.bio}
                    onChange={(event) => setProfileForm((old) => ({ ...old, bio: event.target.value }))}
                    placeholder={t('placeholders.bio')}
                  />
                </Label>
              </div>
            </div>

            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {t('actions.save')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {contactDialogOpen ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('dialogs.contact.title')}>
          <div className="vx-profile-dialog__backdrop" onClick={() => setContactDialogOpen(false)} />
          <form className="vx-profile-dialog__content vx-account-profile-dialog" onSubmit={(event) => void submitContact(event)}>
            <header className="vx-account-profile-dialog__header">
              <h3>{t('dialogs.contact.title')}</h3>
              <p>{t('dialogs.contact.description')}</p>
            </header>
            <Label>
              {t('fields.email')}
              <Input
                type="email"
                value={contactForm.email}
                onChange={(event) => setContactForm((old) => ({ ...old, email: event.target.value }))}
                autoComplete="email"
              />
            </Label>
            <Label>
              {t('fields.phone')}
              <Input
                type="tel"
                value={contactForm.phone}
                onChange={(event) => setContactForm((old) => ({ ...old, phone: event.target.value }))}
                autoComplete="tel"
              />
            </Label>
            <Label>
              {t('fields.timezone')}
              <Input
                value={contactForm.timezone}
                onChange={(event) => setContactForm((old) => ({ ...old, timezone: event.target.value }))}
                placeholder={t('placeholders.timezone')}
              />
            </Label>
            <Label>
              {t('fields.language')}
              <NativeSelect
                className="vx-input"
                value={contactForm.language}
                onChange={(event) => setContactForm((old) => ({ ...old, language: event.target.value }))}
              >
                <option value="">{t('common.empty')}</option>
                <option value="zh-CN">{t('language.zhCN')}</option>
                <option value="en-US">{t('language.enUS')}</option>
              </NativeSelect>
            </Label>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {t('actions.save')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {passwordDialogOpen ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('dialogs.password.title')}>
          <div className="vx-profile-dialog__backdrop" onClick={() => setPasswordDialogOpen(false)} />
          <form className="vx-profile-dialog__content vx-account-profile-dialog" onSubmit={(event) => void submitPassword(event)}>
            <header className="vx-account-profile-dialog__header">
              <h3>{t('dialogs.password.title')}</h3>
              <p>{t('dialogs.password.description')}</p>
            </header>
            <Label>
              {t('fields.currentPassword')}
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((old) => ({ ...old, currentPassword: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </Label>
            <Label>
              {t('fields.nextPassword')}
              <Input
                type="password"
                value={passwordForm.nextPassword}
                onChange={(event) => setPasswordForm((old) => ({ ...old, nextPassword: event.target.value }))}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Label>
            <Label>
              {t('fields.confirmPassword')}
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((old) => ({ ...old, confirmPassword: event.target.value }))}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Label>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {t('actions.updatePassword')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {unbindTarget ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('connectedAccounts.dialogs.unbindTitle')}>
          <div className="vx-profile-dialog__backdrop" onClick={() => setUnbindTarget(null)} />
          <form
            className="vx-profile-dialog__content vx-account-profile-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              confirmUnbindConnectedAccount();
            }}
          >
            <header className="vx-account-profile-dialog__header">
              <h3>{t('connectedAccounts.dialogs.unbindTitle')}</h3>
              <p>
                {t('connectedAccounts.dialogs.unbindDescription', {
                  provider: t(`connectedAccounts.providers.${unbindTarget.provider}.name`),
                })}
              </p>
            </header>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setUnbindTarget(null)}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit">
                {t('connectedAccounts.actions.confirmUnbind')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
