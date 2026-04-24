'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { changeUserPassword, fetchUserProfile, updateUserProfile } from '@/api/console-bff';
import { Button, Input, Label } from '@/components/ui/primitives';
import type { ConsoleUserProfile } from '@/entities/console';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ActionButton } from '@/modules/shared/ActionButton';

export function ProfilePage() {
  const { session, refreshSession } = useConsoleSession();
  const [profile, setProfile] = useState<ConsoleUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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

    void fetchUserProfile()
      .then((data) => {
        if (!active) {
          return;
        }

        if (data) {
          setProfile(data);
          setError(null);
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
          setError('个人资料明细暂未初始化，当前先展示账号基础信息。');
          return;
        }

        setProfile(null);
        setError('未读取到个人资料。');
      })
      .catch(() => {
        if (active) {
          setError('个人资料读取失败，请稍后重试。');
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

  function resetStatus() {
    setMessage(null);
    setError(null);
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
    resetStatus();
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
    resetStatus();
  }

  function openPasswordDialog() {
    setPasswordForm({
      currentPassword: '',
      nextPassword: '',
      confirmPassword: '',
    });
    setPasswordDialogOpen(true);
    resetStatus();
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    try {
      const updated = await updateUserProfile({
        displayName: profileForm.displayName,
        avatarUrl: profileForm.avatarUrl,
        headline: profileForm.headline,
        bio: profileForm.bio,
      });
      setProfile(updated);
      setProfileDialogOpen(false);
      setMessage('基础资料已更新。');
      await refreshSession();
    } catch {
      setError('基础资料保存失败，请稍后重试。');
    }
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    try {
      const updated = await updateUserProfile({
        email: contactForm.email,
        phone: contactForm.phone,
        timezone: contactForm.timezone,
        language: contactForm.language,
      });
      setProfile(updated);
      setContactDialogOpen(false);
      setMessage('联系方式已更新。');
      await refreshSession();
    } catch {
      setError('联系方式保存失败，请稍后重试。');
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      setError('两次输入的新密码不一致。');
      return;
    }

    try {
      await changeUserPassword({
        currentPassword: passwordForm.currentPassword,
        nextPassword: passwordForm.nextPassword,
      });
      setPasswordDialogOpen(false);
      setMessage('密码已更新。');
    } catch {
      setError('密码更新失败，请确认当前密码是否正确。');
    }
  }

  const displayName = profile?.displayName || profile?.username || '--';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="vx-page-stack vx-profile-page">
      <PageHeader
        title="个人信息"
        description="在一个页面内管理头像、姓名、联系方式与账号密码。"
      />

      {message ? <p className="vx-profile-message">{message}</p> : null}
      {error ? <p className="vx-profile-error">{error}</p> : null}

      <section className="vx-profile-group">
        <header className="vx-profile-group__header">
          <div>
            <h2>基础资料</h2>
            <p>显示名称、头像和公开简介。</p>
          </div>
          <ActionButton icon="edit" onClick={openProfileDialog}>
            编辑资料
          </ActionButton>
        </header>
        <div className="vx-profile-row">
          <span>头像</span>
          <div className="vx-profile-avatar">
            {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={displayName} /> : <strong>{initials}</strong>}
          </div>
        </div>
        <div className="vx-profile-row">
          <span>显示名称</span>
          <strong>{loading ? '...' : displayName}</strong>
        </div>
        <div className="vx-profile-row">
          <span>账号名</span>
          <strong>{loading ? '...' : profile?.username ?? '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>头衔</span>
          <strong>{loading ? '...' : profile?.headline || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>简介</span>
          <strong>{loading ? '...' : profile?.bio || '--'}</strong>
        </div>
      </section>

      <section className="vx-profile-group">
        <header className="vx-profile-group__header">
          <div>
            <h2>联系方式</h2>
            <p>用于通知、找回账号和本地化显示。</p>
          </div>
          <ActionButton icon="edit" onClick={openContactDialog}>
            编辑联系信息
          </ActionButton>
        </header>
        <div className="vx-profile-row">
          <span>邮箱</span>
          <strong>{loading ? '...' : profile?.email || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>手机号</span>
          <strong>{loading ? '...' : profile?.phone || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>时区</span>
          <strong>{loading ? '...' : profile?.timezone || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>语言</span>
          <strong>{loading ? '...' : profile?.language || '--'}</strong>
        </div>
      </section>

      <section className="vx-profile-group">
        <header className="vx-profile-group__header">
          <div>
            <h2>安全凭据</h2>
            <p>密码仅用于登录校验，不会在页面明文展示。</p>
          </div>
          <ActionButton icon="shield-check" onClick={openPasswordDialog}>
            修改密码
          </ActionButton>
        </header>
        <div className="vx-profile-row">
          <span>密码</span>
          <strong>已设置</strong>
        </div>
        <div className="vx-profile-row">
          <span>资料更新时间</span>
          <strong>{profile?.profileUpdatedAt ? new Date(profile.profileUpdatedAt).toLocaleString() : '--'}</strong>
        </div>
      </section>

      {profileDialogOpen ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label="编辑基础资料">
          <div className="vx-profile-dialog__backdrop" onClick={() => setProfileDialogOpen(false)} />
          <form className="vx-profile-dialog__content" onSubmit={(event) => void submitProfile(event)}>
            <h3>编辑基础资料</h3>
            <Label>
              显示名称
              <Input value={profileForm.displayName} onChange={(event) => setProfileForm((old) => ({ ...old, displayName: event.target.value }))} />
            </Label>
            <Label>
              头像链接
              <Input value={profileForm.avatarUrl} onChange={(event) => setProfileForm((old) => ({ ...old, avatarUrl: event.target.value }))} />
            </Label>
            <Label>
              头衔
              <Input value={profileForm.headline} onChange={(event) => setProfileForm((old) => ({ ...old, headline: event.target.value }))} />
            </Label>
            <Label>
              简介
              <textarea
                className="vx-profile-dialog__textarea"
                rows={4}
                value={profileForm.bio}
                onChange={(event) => setProfileForm((old) => ({ ...old, bio: event.target.value }))}
              />
            </Label>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </div>
      ) : null}

      {contactDialogOpen ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label="编辑联系信息">
          <div className="vx-profile-dialog__backdrop" onClick={() => setContactDialogOpen(false)} />
          <form className="vx-profile-dialog__content" onSubmit={(event) => void submitContact(event)}>
            <h3>编辑联系信息</h3>
            <Label>
              邮箱
              <Input value={contactForm.email} onChange={(event) => setContactForm((old) => ({ ...old, email: event.target.value }))} />
            </Label>
            <Label>
              手机号
              <Input value={contactForm.phone} onChange={(event) => setContactForm((old) => ({ ...old, phone: event.target.value }))} />
            </Label>
            <Label>
              时区
              <Input value={contactForm.timezone} onChange={(event) => setContactForm((old) => ({ ...old, timezone: event.target.value }))} />
            </Label>
            <Label>
              语言
              <Input value={contactForm.language} onChange={(event) => setContactForm((old) => ({ ...old, language: event.target.value }))} />
            </Label>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </div>
      ) : null}

      {passwordDialogOpen ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label="修改密码">
          <div className="vx-profile-dialog__backdrop" onClick={() => setPasswordDialogOpen(false)} />
          <form className="vx-profile-dialog__content" onSubmit={(event) => void submitPassword(event)}>
            <h3>修改密码</h3>
            <Label>
              当前密码
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((old) => ({ ...old, currentPassword: event.target.value }))}
              />
            </Label>
            <Label>
              新密码
              <Input
                type="password"
                value={passwordForm.nextPassword}
                onChange={(event) => setPasswordForm((old) => ({ ...old, nextPassword: event.target.value }))}
              />
            </Label>
            <Label>
              再次输入新密码
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((old) => ({ ...old, confirmPassword: event.target.value }))}
              />
            </Label>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>取消</Button>
              <Button type="submit">更新密码</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
