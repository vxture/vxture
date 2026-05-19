"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Icon, type IconName } from "@vxture/design-system";
import { fetchOrganizationProfile } from "@/api/console-bff";
import { Avatar, Badge, Button, Input, Label } from "@vxture/design-system";
import type { ConsoleOrganizationProfile } from "@/entities/console";
import { useConsoleSession } from "@/features/session/ConsoleSessionProvider";
import { useLocale, useTranslations } from "next-intl";
import { ActionButton } from "@/modules/shared/ActionButton";
import { PageHeader } from "@/modules/shared/PageHeader";

type OrganizationField = {
  icon: IconName;
  label: string;
  value: string;
  multiline?: boolean;
};
type LogoOverride = {
  logoUrl: string | null;
  updatedAt: string;
};

const ORGANIZATION_LOGO_STORAGE_PREFIX = "vxture.console.organizationLogo";
const LOGO_UPLOAD_MAX_SIZE = 5 * 1024 * 1024;
const LOGO_CANVAS_SIZE = 512;

function displayValue(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function formatOrganizationDate(
  value: string | null | undefined,
  locale: string,
  fallback: string,
) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function logoStyle(value?: string | null): CSSProperties | undefined {
  const logoUrl = value?.trim();
  return logoUrl
    ? { backgroundImage: `url(${JSON.stringify(logoUrl)})` }
    : undefined;
}

function organizationInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function organizationLogoStorageKey(tenantId?: string | null) {
  return `${ORGANIZATION_LOGO_STORAGE_PREFIX}:${tenantId || "platform"}`;
}

function readLogoOverride(tenantId?: string | null): LogoOverride | null {
  try {
    const stored = window.localStorage.getItem(
      organizationLogoStorageKey(tenantId),
    );
    return stored ? (JSON.parse(stored) as LogoOverride) : null;
  } catch {
    return null;
  }
}

function writeLogoOverride(tenantId: string | undefined, value: LogoOverride) {
  window.localStorage.setItem(
    organizationLogoStorageKey(tenantId),
    JSON.stringify(value),
  );
}

function resizeLogoImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = LOGO_CANVAS_SIZE;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      context.clearRect(0, 0, size, size);
      const ratio = Math.min(size / image.width, size / image.height);
      const width = image.width * ratio;
      const height = image.height * ratio;
      const x = (size - width) / 2;
      const y = (size - height) / 2;
      context.drawImage(image, x, y, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = dataUrl;
  });
}

function readLogoFile(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Invalid file result"));
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  }).then((dataUrl) => resizeLogoImage(dataUrl));
}

export function OrganizationPage() {
  const t = useTranslations("organizationPage");
  const locale = useLocale();
  const { session } = useConsoleSession();
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<ConsoleOrganizationProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const [logoOverride, setLogoOverride] = useState<LogoOverride | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoForm, setLogoForm] = useState({
    logoUrl: "",
  });

  useEffect(() => {
    let active = true;

    setLoading(true);
    void fetchOrganizationProfile()
      .then((data) => {
        if (!active) {
          return;
        }

        setProfile(data);
        setErrorKey(data ? null : "feedback.noProfile");
      })
      .catch(() => {
        if (active) {
          setErrorKey("feedback.loadError");
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
  }, [session.tenant?.id, session.tenant?.mode]);

  useEffect(() => {
    setLogoOverride(readLogoOverride(session.tenant?.id));
  }, [session.tenant?.id]);

  function openLogoDialog() {
    const currentLogo = logoOverride ? logoOverride.logoUrl : profile?.logoUrl;
    setLogoForm({ logoUrl: currentLogo ?? "" });
    setLogoDialogOpen(true);
    setErrorKey(null);
    setMessageKey(null);
  }

  async function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorKey("feedback.logoFileTypeError");
      return;
    }

    if (file.size > LOGO_UPLOAD_MAX_SIZE) {
      setErrorKey("feedback.logoFileSizeError");
      return;
    }

    try {
      const nextLogo = await readLogoFile(file);
      setLogoForm({ logoUrl: nextLogo });
      setErrorKey(null);
    } catch {
      setErrorKey("feedback.logoReadError");
    }
  }

  function saveLogo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextOverride: LogoOverride = {
      logoUrl: logoForm.logoUrl.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    writeLogoOverride(session.tenant?.id, nextOverride);
    setLogoOverride(nextOverride);
    setLogoDialogOpen(false);
    setErrorKey(null);
    setMessageKey("feedback.logoSaved");
  }

  function clearLogo() {
    const nextOverride: LogoOverride = {
      logoUrl: null,
      updatedAt: new Date().toISOString(),
    };
    writeLogoOverride(session.tenant?.id, nextOverride);
    setLogoOverride(nextOverride);
    setLogoForm({ logoUrl: "" });
    setLogoDialogOpen(false);
    setErrorKey(null);
    setMessageKey("feedback.logoCleared");
  }

  const empty = t("common.empty");
  const loadingText = t("common.loading");
  const displayName = displayValue(
    profile?.displayName,
    profile?.companyName ||
      profile?.tenantName ||
      session.tenant?.name ||
      empty,
  );
  const logoInitials = organizationInitials(displayName || "VX");
  const effectiveLogoUrl = logoOverride
    ? logoOverride.logoUrl
    : profile?.logoUrl;
  const location = [
    profile?.countryCode,
    profile?.province,
    profile?.city,
    profile?.district,
  ]
    .filter(Boolean)
    .join(" / ");
  const status = profile ? t(`status.tenant.${profile.status}`) : empty;
  const verifiedStatus = profile?.verifiedStatus
    ? t(`status.verified.${profile.verifiedStatus}`)
    : empty;
  const updatedAt = formatOrganizationDate(
    logoOverride?.updatedAt ?? profile?.updatedAt,
    locale,
    empty,
  );
  const verifiedAt = formatOrganizationDate(profile?.verifiedAt, locale, empty);
  const tenantType = profile ? t(`tenantType.${profile.tenantType}`) : empty;
  const logoStatus = effectiveLogoUrl
    ? t("summary.customLogo")
    : t("summary.defaultLogo");
  const industryScale =
    [profile?.industry, profile?.scale].filter(Boolean).join(" / ") || empty;

  const foundationFields: OrganizationField[] = [
    {
      icon: "building-library",
      label: t("fields.organizationName"),
      value: loading ? loadingText : displayName,
    },
    {
      icon: "medal",
      label: t("fields.companyName"),
      value: loading ? loadingText : displayValue(profile?.companyName, empty),
    },
    {
      icon: "key",
      label: t("fields.tenantCode"),
      value: loading ? loadingText : displayValue(profile?.tenantCode, empty),
    },
    {
      icon: "users",
      label: t("fields.tenantType"),
      value: loading ? loadingText : tenantType,
    },
    {
      icon: "table",
      label: t("fields.industryScale"),
      value: loading ? loadingText : industryScale,
    },
    {
      icon: "chat-circle",
      label: t("fields.description"),
      value: loading ? loadingText : displayValue(profile?.description, empty),
      multiline: true,
    },
  ];

  const statusFields: OrganizationField[] = [
    {
      icon: "server",
      label: t("fields.tenantStatus"),
      value: loading ? loadingText : status,
    },
    {
      icon: "shield-check",
      label: t("fields.verifiedStatus"),
      value: loading ? loadingText : verifiedStatus,
    },
    {
      icon: "key",
      label: t("fields.unifiedSocialCreditCode"),
      value: loading
        ? loadingText
        : displayValue(profile?.unifiedSocialCreditCode, empty),
    },
    {
      icon: "clock",
      label: t("fields.verifiedAt"),
      value: loading ? loadingText : verifiedAt,
    },
    {
      icon: "warning",
      label: t("fields.rejectedReason"),
      value: loading
        ? loadingText
        : displayValue(profile?.rejectedReason, empty),
    },
  ];

  const contactFields: OrganizationField[] = [
    {
      icon: "user",
      label: t("fields.contactName"),
      value: loading ? loadingText : displayValue(profile?.contactName, empty),
    },
    {
      icon: "phone",
      label: t("fields.contactPhone"),
      value: loading ? loadingText : displayValue(profile?.contactPhone, empty),
    },
    {
      icon: "mail",
      label: t("fields.contactEmail"),
      value: loading ? loadingText : displayValue(profile?.contactEmail, empty),
    },
    {
      icon: "globe",
      label: t("fields.primaryDomain"),
      value: loading
        ? loadingText
        : displayValue(profile?.primaryDomain, empty),
    },
    {
      icon: "map-pin",
      label: t("fields.location"),
      value: loading ? loadingText : displayValue(location, empty),
    },
    {
      icon: "map-pin",
      label: t("fields.address"),
      value: loading ? loadingText : displayValue(profile?.address, empty),
      multiline: true,
    },
    {
      icon: "mail",
      label: t("fields.postalCode"),
      value: loading ? loadingText : displayValue(profile?.postalCode, empty),
    },
  ];

  const localizationFields: OrganizationField[] = [
    {
      icon: "globe",
      label: t("fields.language"),
      value: loading ? loadingText : displayValue(profile?.language, empty),
    },
    {
      icon: "clock",
      label: t("fields.timeZone"),
      value: loading ? loadingText : displayValue(profile?.timeZone, empty),
    },
    {
      icon: "database",
      label: t("fields.businessLicenseUrl"),
      value: loading
        ? loadingText
        : displayValue(profile?.businessLicenseUrl, empty),
      multiline: true,
    },
    {
      icon: "clock",
      label: t("fields.updatedAt"),
      value: loading ? loadingText : updatedAt,
    },
  ];

  function renderField(field: OrganizationField) {
    return (
      <div
        key={field.label}
        className={
          field.multiline
            ? "vx-account-profile-field vx-account-profile-field--multiline"
            : "vx-account-profile-field"
        }
        title={`${field.label}: ${field.value}`}
      >
        <span className="vx-account-profile-field__icon" aria-hidden="true">
          <Icon name={field.icon} size="xs" fallback="placeholder" />
        </span>
        <span className="vx-account-profile-field__label">{field.label}</span>
        <strong
          className={
            field.value === empty
              ? "vx-account-profile-field__value vx-account-profile-field__value--empty"
              : "vx-account-profile-field__value"
          }
        >
          {field.value}
        </strong>
      </div>
    );
  }

  return (
    <div className="vx-page-stack vx-profile-page vx-account-profile-page vx-organization-profile-page">
      <PageHeader
        eyebrow={t("header.eyebrow")}
        title={t("header.title")}
        description={t("header.description")}
      />

      {messageKey ? (
        <p className="vx-profile-message">{t(messageKey)}</p>
      ) : null}
      {errorKey ? <p className="vx-profile-error">{t(errorKey)}</p> : null}

      <div className="vx-account-profile-layout">
        <aside className="vx-account-profile-identity">
          <section className="vx-account-profile-avatar-card vx-organization-profile-card">
            <Button
              variant="ghost"
              size="icon"
              className="vx-organization-logo-button"
              aria-label={t("logo.edit")}
              title={t("logo.edit")}
              onClick={openLogoDialog}
            >
              <Avatar
                className={
                  effectiveLogoUrl
                    ? "vx-organization-logo vx-organization-logo--image"
                    : "vx-organization-logo"
                }
                role="img"
                aria-label={t("logo.alt", { name: displayName })}
                style={logoStyle(effectiveLogoUrl)}
              >
                {!effectiveLogoUrl ? (
                  <strong>{logoInitials}</strong>
                ) : (
                  <span className="vx-account-profile-avatar__label">
                    {displayName}
                  </span>
                )}
              </Avatar>
              <span
                className="vx-account-profile-avatar-button__edit"
                aria-hidden="true"
              >
                <Icon name="edit" size="xs" fallback="placeholder" />
              </span>
            </Button>

            <div className="vx-account-profile-avatar-card__copy">
              <strong>{loading ? loadingText : displayName}</strong>
              <span>
                {profile?.tenantCode || session.tenant?.tenantCode || empty}
              </span>
              <Badge
                className={`vx-organization-status vx-organization-status--${profile?.status ?? "trial"}`}
              >
                {loading ? loadingText : status}
              </Badge>
            </div>

            <div className="vx-account-profile-avatar-card__actions">
              <ActionButton icon="edit" size="sm" onClick={openLogoDialog}>
                {t("actions.editLogo")}
              </ActionButton>
              <ActionButton
                variant="outline"
                icon="x"
                size="sm"
                onClick={clearLogo}
                disabled={!effectiveLogoUrl}
              >
                {t("actions.clearLogo")}
              </ActionButton>
            </div>
          </section>

          <section className="vx-account-profile-summary">
            <div className="vx-account-profile-summary__row">
              <span>{t("summary.organization")}</span>
              <strong title={displayName}>
                {loading ? loadingText : displayName}
              </strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t("summary.logo")}</span>
              <strong>{loading ? loadingText : logoStatus}</strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t("summary.tenant")}</span>
              <strong
                title={profile?.tenantName || session.tenant?.name || empty}
              >
                {loading
                  ? loadingText
                  : displayValue(
                      profile?.tenantName,
                      session.tenant?.name || empty,
                    )}
              </strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t("summary.scope")}</span>
              <strong>{t("summary.orgEqualsTenant")}</strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t("summary.verified")}</span>
              <strong>{loading ? loadingText : verifiedStatus}</strong>
            </div>
            <div className="vx-account-profile-summary__row">
              <span>{t("summary.updatedAt")}</span>
              <strong title={updatedAt}>
                {loading ? loadingText : updatedAt}
              </strong>
            </div>
          </section>
        </aside>

        <main className="vx-account-profile-main">
          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t("sections.foundation.title")}</h2>
                <p>{t("sections.foundation.description")}</p>
              </div>
            </header>
            <div className="vx-account-profile-field-list">
              {foundationFields.map(renderField)}
            </div>
          </section>

          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t("sections.status.title")}</h2>
                <p>{t("sections.status.description")}</p>
              </div>
            </header>
            <div className="vx-account-profile-field-list">
              {statusFields.map(renderField)}
            </div>
          </section>

          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t("sections.contact.title")}</h2>
                <p>{t("sections.contact.description")}</p>
              </div>
            </header>
            <div className="vx-account-profile-field-list">
              {contactFields.map(renderField)}
            </div>
          </section>

          <section className="vx-account-profile-section">
            <header className="vx-account-profile-section__header">
              <div>
                <h2>{t("sections.localization.title")}</h2>
                <p>{t("sections.localization.description")}</p>
              </div>
            </header>
            <div className="vx-account-profile-field-list">
              {localizationFields.map(renderField)}
            </div>
          </section>
        </main>
      </div>

      {logoDialogOpen ? (
        <div
          className="vx-profile-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={t("dialogs.logo.title")}
        >
          <div
            className="vx-profile-dialog__backdrop"
            onClick={() => setLogoDialogOpen(false)}
          />
          <form
            className="vx-profile-dialog__content vx-account-profile-dialog vx-account-profile-dialog--wide"
            onSubmit={(event) => saveLogo(event)}
          >
            <header className="vx-account-profile-dialog__header">
              <h3>{t("dialogs.logo.title")}</h3>
              <p>{t("dialogs.logo.description")}</p>
            </header>

            <div className="vx-account-profile-dialog-grid">
              <div className="vx-account-avatar-editor vx-organization-logo-editor">
                <Avatar
                  className={
                    logoForm.logoUrl
                      ? "vx-organization-logo vx-organization-logo--image"
                      : "vx-organization-logo"
                  }
                  role="img"
                  aria-label={t("logo.previewAlt", { name: displayName })}
                  style={logoStyle(logoForm.logoUrl)}
                >
                  {!logoForm.logoUrl ? (
                    <strong>{logoInitials}</strong>
                  ) : (
                    <span className="vx-account-profile-avatar__label">
                      {displayName}
                    </span>
                  )}
                </Avatar>
                <div>
                  <strong>{displayName}</strong>
                  <span>
                    {logoForm.logoUrl
                      ? t("logo.customPreview")
                      : t("logo.defaultPreview")}
                  </span>
                </div>
              </div>

              <div className="vx-account-profile-form-grid">
                <Label className="vx-account-profile-form-grid__wide">
                  {t("fields.logoUrl")}
                  <div className="vx-account-profile-input-row">
                    <Input
                      value={logoForm.logoUrl}
                      onChange={(event) =>
                        setLogoForm({ logoUrl: event.target.value })
                      }
                      placeholder={t("placeholders.logoUrl")}
                      autoComplete="url"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setLogoForm({ logoUrl: "" })}
                    >
                      {t("actions.clear")}
                    </Button>
                  </div>
                </Label>
                <div className="vx-organization-logo-upload vx-account-profile-form-grid__wide">
                  <Input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="vx-organization-logo-upload__input"
                    onChange={(event) => void handleLogoFileChange(event)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => logoFileInputRef.current?.click()}
                  >
                    <Icon
                      name="plus"
                      size="xs"
                      fallback="placeholder"
                      className="vx-btn__icon"
                    />
                    <span>{t("actions.uploadLogo")}</span>
                  </Button>
                  <p>{t("dialogs.logo.uploadHint")}</p>
                </div>
              </div>
            </div>

            <div className="vx-profile-dialog__actions">
              <Button
                variant="outline"
                onClick={() => setLogoDialogOpen(false)}
              >
                {t("actions.cancel")}
              </Button>
              <Button
                variant="outline"
                onClick={clearLogo}
                disabled={!logoForm.logoUrl && !effectiveLogoUrl}
              >
                {t("actions.clearLogo")}
              </Button>
              <Button type="submit">{t("actions.save")}</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
