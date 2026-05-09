import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_CONFIGS, SUPPORTED_LOCALES, type Locale, type Theme } from "@vxture/shared";
import { Icon } from "../../icons";

export type AuthLoginScreen = "login" | "phone" | "forgot";
export type AuthLoginTab = Exclude<AuthLoginScreen, "forgot">;
export type AuthSocialProvider = "feishu" | "dingtalk" | "wechat";
export type AuthFieldIcon = "user" | "lock" | "phone" | "shield" | "mail";

export interface AuthVisualStat {
  value: string;
  label: string;
}

export interface AuthVisualConfig {
  pageBackgroundImage?: string;
  leftBackgroundImage?: string;
  title?: string;
  description?: string;
  statusText?: string;
  stats?: AuthVisualStat[];
}

export interface UnifiedAuthPageProps {
  className?: string;
  pageBackgroundImage?: string;
  visual?: AuthVisualConfig;
  header?: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
}

export interface AuthLoginLayoutProps {
  title?: string;
  children: ReactNode;
}

export interface AuthFlowFormProps {
  input: ReactNode;
  primary: ReactNode;
  social?: ReactNode;
  footer?: ReactNode;
  reserveSocialSpace?: boolean;
  reserveFooterSpace?: boolean;
  inputAriaLabel?: string;
  primaryAriaLabel?: string;
  socialAriaLabel?: string;
  footerAriaLabel?: string;
  autoComplete?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface AuthTabsProps {
  active: AuthLoginTab;
  onChange: (screen: AuthLoginTab) => void;
  passwordLabel?: string;
  phoneLabel?: string;
}

export interface AuthFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  icon?: AuthFieldIcon | ReactNode;
  value: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export interface AuthPrimaryButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
  disabled?: boolean;
  disabledLabel?: string;
}

export interface AuthSocialButtonConfig {
  provider: AuthSocialProvider;
  label: string;
  disabled?: boolean;
  iconSrc?: string;
  onClick?: () => void;
}

export interface AuthSocialButtonsProps {
  providers: AuthSocialButtonConfig[];
  separatorLabel?: string;
}

export function useAuthVerificationCountdown(active: boolean, seconds = 5) {
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);

  useEffect(() => {
    if (!active) {
      setRemainingSeconds(seconds);
      return undefined;
    }

    setRemainingSeconds(seconds);
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [active, seconds]);

  return remainingSeconds;
}

export interface LocaleSelectOption {
  locale: Locale;
  label?: string;
  nativeName?: string;
  flag?: string;
}

export interface LocaleSelectPanelProps {
  activeLocale: Locale;
  options?: LocaleSelectOption[];
  onSelect: (locale: Locale) => void;
}

export interface AuthChromeHeaderProps {
  brandHref?: string;
  brandLogoSrc?: string;
  brandLogoAlt?: string;
  brandLabel?: ReactNode;
  currentLocale?: Locale;
  localeOptions?: LocaleSelectOption[];
  localeButtonLabel?: string;
  localePanelLabel?: string;
  currentTheme?: Theme | string;
  themeButtonLabel?: string;
  lightThemeLabel?: string;
  darkThemeLabel?: string;
  onLocaleChange?: (locale: Locale) => void;
  onThemeChange?: (theme: "light" | "dark") => void;
}

export interface AuthChromeFooterLink {
  href: string;
  label: ReactNode;
}

export interface AuthChromeFooterProps {
  copyright?: ReactNode;
  links?: AuthChromeFooterLink[];
  legalLabel?: string;
}

export interface AuthTurnstileProps {
  siteKey?: string;
  action?: string;
  cData?: string;
  appearance?: "always" | "execute" | "interaction-only";
  size?: "normal" | "flexible";
  theme?: "auto" | "light" | "dark";
  language?: string;
  resetSignal?: number;
  className?: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: (errorCode?: string) => void;
}

export interface AuthLoginOptionsProps {
  disabled?: boolean;
  rememberChecked: boolean;
  agreementChecked: boolean;
  rememberLabel?: ReactNode;
  agreementPrefix?: ReactNode;
  agreementJoiner?: ReactNode;
  termsLabel?: ReactNode;
  privacyLabel?: ReactNode;
  termsHref?: string;
  privacyHref?: string;
  forgotLabel?: ReactNode;
  forgotHref?: string;
  forgetMeLabel?: ReactNode;
  forgetMeTitle?: string;
  onRememberChange: (checked: boolean) => void;
  onAgreementChange: (checked: boolean) => void;
  onForgot?: () => void;
  onForgetMe?: () => void;
}

export interface AuthLoginTemplateProps extends Omit<UnifiedAuthPageProps, "children"> {
  title?: string;
  useLoginLayout?: boolean;
  children: ReactNode;
}

export interface AuthLoginOptionOverrides
  extends Pick<
    AuthLoginOptionsProps,
    | "rememberLabel"
    | "agreementPrefix"
    | "agreementJoiner"
    | "termsLabel"
    | "privacyLabel"
    | "termsHref"
    | "privacyHref"
    | "forgotLabel"
    | "forgotHref"
    | "forgetMeLabel"
    | "forgetMeTitle"
  > {}

export interface AuthPasswordLoginPanelProps {
  tabs?: ReactNode;
  identifier: string;
  password: string;
  rememberChecked: boolean;
  agreementChecked: boolean;
  errors?: {
    identifier?: string;
    password?: string;
    form?: string;
  };
  loading: boolean;
  turnstile?: ReactNode;
  social?: ReactNode;
  footer?: ReactNode;
  reserveSocialSpace?: boolean;
  reserveFooterSpace?: boolean;
  primaryDisabled?: boolean;
  primaryDisabledLabel?: string;
  submitLabel?: string;
  submitLoadingLabel?: string;
  identifierLabel?: string;
  identifierName?: string;
  identifierPlaceholder?: string;
  identifierAutoComplete?: string;
  passwordLabel?: string;
  passwordName?: string;
  passwordPlaceholder?: string;
  passwordAutoComplete?: string;
  options?: AuthLoginOptionOverrides;
  onChangeIdentifier: (value: string) => void;
  onChangePassword: (value: string) => void;
  onRememberChange: (checked: boolean) => void;
  onAgreementChange: (checked: boolean) => void;
  onForgot?: () => void;
  onForgetMe?: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface AuthPhoneLoginPanelProps {
  tabs?: ReactNode;
  phone: string;
  code: string;
  rememberChecked: boolean;
  agreementChecked: boolean;
  errors?: {
    phone?: string;
    code?: string;
    form?: string;
  };
  loading: boolean;
  codeSending?: boolean;
  codeCountdown?: number;
  sendCodeDisabled?: boolean;
  turnstile?: ReactNode;
  social?: ReactNode;
  footer?: ReactNode;
  reserveSocialSpace?: boolean;
  reserveFooterSpace?: boolean;
  primaryDisabled?: boolean;
  primaryDisabledLabel?: string;
  submitLabel?: string;
  submitLoadingLabel?: string;
  phoneLabel?: string;
  phoneName?: string;
  phonePlaceholder?: string;
  codeLabel?: string;
  codeName?: string;
  codePlaceholder?: string;
  sendCodeLabel?: string;
  sendingCodeLabel?: string;
  verificationPendingLabel?: string;
  retryCodeLabel?: (seconds: number) => string;
  options?: AuthLoginOptionOverrides;
  onChangePhone: (value: string) => void;
  onChangeCode: (value: string) => void;
  onSendCode: () => void;
  onRememberChange: (checked: boolean) => void;
  onAgreementChange: (checked: boolean) => void;
  onForgot?: () => void;
  onForgetMe?: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface AuthForgotPasswordPanelProps {
  email: string;
  error?: string;
  loading: boolean;
  resetSent?: boolean;
  backLabel?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  sentTitle?: ReactNode;
  sentDescription?: ReactNode;
  sentHint?: ReactNode;
  sentEmailFallback?: ReactNode;
  sentActionLabel?: ReactNode;
  emailLabel?: string;
  emailName?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  submitLoadingLabel?: string;
  onBack: () => void;
  onChangeEmail: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const DEFAULT_PAGE_BACKGROUND = "/images/login-bg-light.jpg";
const DEFAULT_AUTH_BRAND_LOGO = "/brand/vxture-logo-white.png";
const DEFAULT_AUTH_BRAND_LABEL = "vxture.ai";

const DEFAULT_LOCALE_OPTIONS: LocaleSelectOption[] = SUPPORTED_LOCALES.map((locale) => ({
  locale,
  nativeName: LOCALE_CONFIGS[locale].nativeName,
  label: LOCALE_CONFIGS[locale].displayName,
  flag: LOCALE_CONFIGS[locale].flag,
}));

const DEFAULT_AUTH_VISUAL: Required<Omit<AuthVisualConfig, "leftBackgroundImage" | "pageBackgroundImage">> = {
  title: "Build intelligence into everything.",
  description: "Orchestrate models, manage pipelines, and deploy AI workflows at scale from a single workspace.",
  statusText: "All systems operational",
  stats: [
    { value: "40ms", label: "avg latency" },
    { value: "99.97%", label: "uptime SLA" },
    { value: "12B+", label: "tokens/day" },
  ],
};

const DEFAULT_SOCIAL_ICON_SRC: Record<AuthSocialProvider, string> = {
  feishu: "/brand/feishu-logo-icon.svg",
  dingtalk: "/brand/dingtalk-logo-icon.svg",
  wechat: "/brand/wechat_logo_icon.svg",
};

const AUTH_FIELD_ICONS: AuthFieldIcon[] = ["user", "lock", "phone", "shield", "mail"];

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  appearance?: "always" | "execute" | "interaction-only";
  size?: "normal" | "flexible";
  theme?: "auto" | "light" | "dark";
  language?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: (errorCode?: string) => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

export function UnifiedAuthPage({
  className = "",
  pageBackgroundImage = DEFAULT_PAGE_BACKGROUND,
  visual,
  header,
  footer,
  overlay,
  children,
  ariaLabel = "vxture authentication",
}: UnifiedAuthPageProps) {
  const style: CSSProperties & Partial<Record<"--vx-auth-bg" | "--vx-auth-visual-bg", string>> = {};
  if (pageBackgroundImage) {
    style["--vx-auth-bg"] = `url(${pageBackgroundImage})`;
  }
  if (visual?.leftBackgroundImage) {
    style["--vx-auth-visual-bg"] =
      `var(--vx-color-auth-visual-bg), url(${visual.leftBackgroundImage}) center / cover no-repeat`;
  }

  return (
    <section className={`vx-auth-page ${className}`.trim()} style={style}>
      {overlay}
      {header}
      <main className="vx-auth-main">
        <div className="vx-auth-card" aria-label={ariaLabel}>
          <AuthVisualPanel visual={visual} />
          <div className="vx-auth-divider" />
          <div className="vx-auth-form-panel">{children}</div>
        </div>
      </main>
      {footer}
    </section>
  );
}

export function AuthLoginLayout({ title = "欢迎回来", children }: AuthLoginLayoutProps) {
  return (
    <div className="vx-auth-login-layout">
      <section className="vx-auth-section vx-auth-section-title" aria-label="登录标题">
        <div className="vx-auth-panel-heading">
          <h1>{title}</h1>
        </div>
      </section>
      {children}
    </div>
  );
}

export function AuthLoginTemplate({
  title = "欢迎回来",
  useLoginLayout = true,
  children,
  ...pageProps
}: AuthLoginTemplateProps) {
  return (
    <UnifiedAuthPage {...pageProps}>
      {useLoginLayout ? <AuthLoginLayout title={title}>{children}</AuthLoginLayout> : children}
    </UnifiedAuthPage>
  );
}

export function AuthFlowForm({
  input,
  primary,
  social,
  footer,
  reserveSocialSpace = false,
  reserveFooterSpace = false,
  inputAriaLabel = "登录输入",
  primaryAriaLabel = "登录操作",
  socialAriaLabel = "三方登录",
  footerAriaLabel = "登录页脚",
  autoComplete = "on",
  onSubmit,
}: AuthFlowFormProps) {
  return (
    <form className="vx-auth-flow-form" onSubmit={onSubmit} autoComplete={autoComplete}>
      <section className="vx-auth-section vx-auth-section-inputs" aria-label={inputAriaLabel}>
        {input}
      </section>

      <div className="vx-auth-bottom-stack">
        <section className="vx-auth-section vx-auth-section-primary" aria-label={primaryAriaLabel}>
          {primary}
        </section>

        {social ? (
          <section className="vx-auth-section vx-auth-section-social" aria-label={socialAriaLabel}>
            {social}
          </section>
        ) : reserveSocialSpace ? (
          <section className="vx-auth-section vx-auth-section-social vx-auth-section-placeholder" aria-hidden="true" />
        ) : null}

        {footer ? (
          <section className="vx-auth-section vx-auth-section-footer" aria-label={footerAriaLabel}>
            {footer}
          </section>
        ) : reserveFooterSpace ? (
          <section className="vx-auth-section vx-auth-section-footer vx-auth-section-placeholder" aria-hidden="true" />
        ) : null}
      </div>
    </form>
  );
}

export function AuthTabs({ active, onChange, passwordLabel = "密码登录", phoneLabel = "验证码登录" }: AuthTabsProps) {
  return (
    <div className="vx-auth-tabs">
      <button
        type="button"
        className={`vx-auth-tab${active === "login" ? " vx-auth-tab--active" : ""}`}
        onClick={() => onChange("login")}
      >
        {passwordLabel}
      </button>
      <button
        type="button"
        className={`vx-auth-tab${active === "phone" ? " vx-auth-tab--active" : ""}`}
        onClick={() => onChange("phone")}
      >
        {phoneLabel}
      </button>
    </div>
  );
}

export function LocaleSelectPanel({ activeLocale, options = DEFAULT_LOCALE_OPTIONS, onSelect }: LocaleSelectPanelProps) {
  return (
    <div className="vx-locale-panel" role="menu">
      {options.map((option) => {
        const active = option.locale === activeLocale;
        return (
          <button
            key={option.locale}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            className={`vx-locale-option${active ? " vx-locale-option--active" : ""}`}
            onClick={() => onSelect(option.locale)}
          >
            {option.flag ? <span className="vx-locale-option__flag" aria-hidden="true">{option.flag}</span> : null}
            <span className="vx-locale-option__text">
              <strong>{option.nativeName ?? option.label ?? option.locale}</strong>
              {option.label && option.label !== option.nativeName ? <small>{option.label}</small> : null}
            </span>
            {active ? <Icon name="check" size="sm" className="vx-locale-option__check" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function AuthChromeHeader({
  brandHref = "/",
  brandLogoSrc = DEFAULT_AUTH_BRAND_LOGO,
  brandLogoAlt = "",
  brandLabel = DEFAULT_AUTH_BRAND_LABEL,
  currentLocale = DEFAULT_LOCALE,
  localeOptions = DEFAULT_LOCALE_OPTIONS,
  localeButtonLabel = "选择语言",
  localePanelLabel = "语言选择",
  currentTheme = "light",
  themeButtonLabel,
  lightThemeLabel = "浅色模式",
  darkThemeLabel = "深色模式",
  onLocaleChange,
  onThemeChange,
}: AuthChromeHeaderProps) {
  const [localeOpen, setLocaleOpen] = useState(false);
  const localeRef = useRef<HTMLDivElement | null>(null);
  const activeTheme = currentTheme === "dark" ? "dark" : "light";
  const nextTheme = activeTheme === "dark" ? "light" : "dark";
  const resolvedThemeLabel = themeButtonLabel ?? (nextTheme === "dark" ? darkThemeLabel : lightThemeLabel);

  useEffect(() => {
    if (!localeOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!localeRef.current?.contains(event.target as Node)) {
        setLocaleOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLocaleOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [localeOpen]);

  return (
    <header className="vx-auth-header">
      <div className="vx-auth-header-inner">
        <a href={brandHref} className="vx-auth-brand" aria-label={typeof brandLabel === "string" ? brandLabel : undefined}>
          <img
            src={brandLogoSrc}
            alt={brandLogoAlt}
            aria-hidden={brandLogoAlt ? undefined : true}
            width={24}
            height={24}
            className="vx-auth-brand-logo"
            draggable={false}
          />
          <span className="vx-auth-brand-title">{brandLabel}</span>
        </a>

        <div className="vx-auth-header-actions">
          {onLocaleChange ? (
            <div className="vx-auth-locale-control" ref={localeRef}>
              <button
                type="button"
                className={`vx-auth-icon-button${localeOpen ? " vx-auth-icon-button--active" : ""}`}
                aria-label={localeButtonLabel}
                aria-expanded={localeOpen}
                aria-haspopup="menu"
                title={localeButtonLabel}
                onClick={() => setLocaleOpen((open) => !open)}
              >
                <Icon name="globe" size="sm" />
              </button>
              {localeOpen ? (
                <div className="vx-auth-locale-popover" aria-label={localePanelLabel}>
                  <LocaleSelectPanel
                    activeLocale={currentLocale}
                    options={localeOptions}
                    onSelect={(locale) => {
                      setLocaleOpen(false);
                      onLocaleChange(locale);
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {onThemeChange ? (
            <button
              type="button"
              className="vx-auth-icon-button"
              aria-label={resolvedThemeLabel}
              title={resolvedThemeLabel}
              onClick={() => onThemeChange(nextTheme)}
            >
              <Icon name={activeTheme === "dark" ? "moon" : "sun"} size="sm" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function AuthChromeFooter({
  copyright = "© 2026 vxture.ai. All rights reserved.",
  links = [
    { href: "/legal/terms", label: "服务条款" },
    { href: "/legal/privacy", label: "隐私政策" },
    { href: "/legal/cookies", label: "Cookie 使用政策" },
  ],
  legalLabel = "Legal links",
}: AuthChromeFooterProps) {
  return (
    <footer className="vx-auth-footer">
      <div className="vx-auth-footer-inner">
        <span>{copyright}</span>
        <nav className="vx-auth-footer-links" aria-label={legalLabel}>
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function AuthTurnstile({
  siteKey,
  action,
  cData,
  appearance = "interaction-only",
  size = "normal",
  theme = "auto",
  language = "auto",
  resetSignal = 0,
  className = "",
  onToken,
  onExpire,
  onError,
}: AuthTurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const handlersRef = useRef({ onToken, onExpire, onError });

  useEffect(() => {
    handlersRef.current = { onToken, onExpire, onError };
  }, [onError, onExpire, onToken]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return undefined;
    }

    let mounted = true;

    void loadTurnstileScript().then(() => {
      if (!mounted || !containerRef.current || !window.turnstile) {
        return;
      }

      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        cData,
        appearance,
        size,
        theme,
        language,
        callback: (token) => handlersRef.current.onToken(token),
        "expired-callback": () => handlersRef.current.onExpire?.(),
        "timeout-callback": () => handlersRef.current.onExpire?.(),
        "error-callback": (errorCode) => handlersRef.current.onError?.(errorCode),
      });
    }).catch(() => {
      if (mounted) handlersRef.current.onError?.("script-load-failed");
    });

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, appearance, cData, language, siteKey, size, theme]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      handlersRef.current.onExpire?.();
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={`vx-auth-turnstile ${className}`.trim()}>
      <div ref={containerRef} />
    </div>
  );
}

export function AuthField({ label, name, type, placeholder, icon, value, error, hint, autoComplete, autoFocus, disabled, onChange }: AuthFieldProps) {
  return (
    <div className="vx-auth-field">
      <label htmlFor={`vx-auth-${name}`}>{label}</label>
      <div className="vx-auth-input-wrap">
        {icon ? (
          <span className="vx-auth-field-icon" aria-hidden="true">
            {isAuthFieldIcon(icon) ? <AuthFieldIconGlyph icon={icon} /> : icon}
          </span>
        ) : null}
        <input
          id={`vx-auth-${name}`}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
        />
      </div>
      {error ? <p className="vx-auth-error">{error}</p> : null}
      {hint && !error ? <p className="vx-auth-hint">{hint}</p> : null}
    </div>
  );
}

function isAuthFieldIcon(icon: AuthFieldProps["icon"]): icon is AuthFieldIcon {
  return typeof icon === "string" && AUTH_FIELD_ICONS.includes(icon as AuthFieldIcon);
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile can only load in the browser"));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-vx-turnstile="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.vxTurnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export function AuthPrimaryButton({ loading, label, loadingLabel, disabled = false, disabledLabel }: AuthPrimaryButtonProps) {
  const blocked = loading || disabled;

  return (
    <button type="submit" className="vx-auth-primary" disabled={blocked}>
      {loading ? (
        <>
          <span className="vx-auth-spinner" />
          {loadingLabel}
        </>
      ) : disabled && disabledLabel ? (
        disabledLabel
      ) : (
        label
      )}
    </button>
  );
}

export function AuthSocialButtons({ providers, separatorLabel = "其他方式登录" }: AuthSocialButtonsProps) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="vx-auth-or">
        <span />
        <em>{separatorLabel}</em>
        <span />
      </div>
      <div className="vx-auth-socials">
        {providers.map((provider) => (
          <button
            key={provider.provider}
            type="button"
            className={`vx-auth-social ${provider.provider}`}
            onClick={provider.onClick}
            disabled={provider.disabled}
          >
            <BrandProviderIcon provider={provider.provider} src={provider.iconSrc} />
            {provider.label}
          </button>
        ))}
      </div>
    </>
  );
}

export function AuthLoginOptions({
  disabled = false,
  rememberChecked,
  agreementChecked,
  rememberLabel = "记住登录信息",
  agreementPrefix = "我已阅读并同意",
  agreementJoiner = "和",
  termsLabel = "用户协议",
  privacyLabel = "隐私政策",
  termsHref = "#terms",
  privacyHref = "#privacy",
  forgotLabel = "忘记密码？",
  forgotHref = "#forgot-password",
  forgetMeLabel = "忘记我",
  forgetMeTitle = "清除浏览器保存的账号密码",
  onRememberChange,
  onAgreementChange,
  onForgot,
  onForgetMe,
}: AuthLoginOptionsProps) {
  return (
    <div className="vx-auth-control-set">
      <div className="vx-auth-control-row vx-auth-control-row--utility">
        <label className="vx-auth-checkbox">
          <input
            type="checkbox"
            checked={rememberChecked}
            disabled={disabled}
            onChange={(event) => onRememberChange(event.target.checked)}
          />
          <span>{rememberLabel}</span>
        </label>
        <div className="vx-auth-control-links">
          {onForgot ? (
            <button type="button" className="vx-auth-control-link" onClick={onForgot}>
              {forgotLabel}
            </button>
          ) : (
            <a className="vx-auth-control-link" href={forgotHref}>
              {forgotLabel}
            </a>
          )}
          {onForgetMe ? (
            <button
              type="button"
              className="vx-auth-control-link vx-auth-control-link--quiet"
              onClick={onForgetMe}
              disabled={disabled}
              title={forgetMeTitle}
            >
              {forgetMeLabel}
            </button>
          ) : null}
        </div>
      </div>

      <label className="vx-auth-control-row vx-auth-checkbox vx-auth-checkbox--agreement">
        <input
          type="checkbox"
          checked={agreementChecked}
          disabled={disabled}
          onChange={(event) => onAgreementChange(event.target.checked)}
        />
        <span>
          {agreementPrefix}
          <a href={termsHref}>{termsLabel}</a>
          {agreementJoiner}
          <a href={privacyHref}>{privacyLabel}</a>
        </span>
      </label>
    </div>
  );
}

export function AuthPasswordLoginPanel({
  tabs,
  identifier,
  password,
  rememberChecked,
  agreementChecked,
  errors,
  loading,
  turnstile,
  social,
  footer,
  reserveSocialSpace = false,
  reserveFooterSpace = false,
  primaryDisabled = false,
  primaryDisabledLabel,
  submitLabel = "登录",
  submitLoadingLabel = "登录中...",
  identifierLabel = "邮箱",
  identifierName = "username",
  identifierPlaceholder = "email / username / phone",
  identifierAutoComplete = "username",
  passwordLabel = "密码",
  passwordName = "password",
  passwordPlaceholder = "请输入密码",
  passwordAutoComplete = "current-password",
  options,
  onChangeIdentifier,
  onChangePassword,
  onRememberChange,
  onAgreementChange,
  onForgot,
  onForgetMe,
  onSubmit,
}: AuthPasswordLoginPanelProps) {
  return (
    <AuthFlowForm
      onSubmit={onSubmit}
      input={
        <>
          {tabs}
          <div className="vx-auth-field-stack">
            <AuthField
              label={identifierLabel}
              name={identifierName}
              type="text"
              placeholder={identifierPlaceholder}
              icon="user"
              value={identifier}
              error={errors?.identifier}
              autoComplete={identifierAutoComplete}
              autoFocus
              disabled={loading}
              onChange={onChangeIdentifier}
            />
            <AuthField
              label={passwordLabel}
              name={passwordName}
              type="password"
              placeholder={passwordPlaceholder}
              icon="lock"
              value={password}
              error={errors?.password}
              autoComplete={passwordAutoComplete}
              disabled={loading}
              onChange={onChangePassword}
            />

            <AuthLoginOptions
              {...options}
              disabled={loading}
              rememberChecked={rememberChecked}
              agreementChecked={agreementChecked}
              onRememberChange={onRememberChange}
              onAgreementChange={onAgreementChange}
              onForgot={onForgot}
              onForgetMe={onForgetMe}
            />
          </div>
        </>
      }
      primary={
        <>
          {turnstile}
          {errors?.form ? <p className="vx-auth-error vx-auth-form-error">{errors.form}</p> : null}
          <AuthPrimaryButton
            loading={loading}
            disabled={primaryDisabled}
            label={submitLabel}
            loadingLabel={submitLoadingLabel}
            disabledLabel={primaryDisabledLabel}
          />
        </>
      }
      social={social}
      footer={footer}
      reserveSocialSpace={reserveSocialSpace}
      reserveFooterSpace={reserveFooterSpace}
    />
  );
}

export function AuthPhoneLoginPanel({
  tabs,
  phone,
  code,
  rememberChecked,
  agreementChecked,
  errors,
  loading,
  codeSending = false,
  codeCountdown = 0,
  sendCodeDisabled = false,
  turnstile,
  social,
  footer,
  reserveSocialSpace = false,
  reserveFooterSpace = false,
  primaryDisabled = false,
  primaryDisabledLabel,
  submitLabel = "登录",
  submitLoadingLabel = "登录中...",
  phoneLabel = "手机号",
  phoneName = "phone",
  phonePlaceholder = "请输入手机号",
  codeLabel = "验证码",
  codeName = "code",
  codePlaceholder = "请输入 6 位验证码",
  sendCodeLabel = "获取验证码",
  sendingCodeLabel = "发送中...",
  verificationPendingLabel = "验证中...",
  retryCodeLabel = (seconds) => `${seconds}s 后重试`,
  options,
  onChangePhone,
  onChangeCode,
  onSendCode,
  onRememberChange,
  onAgreementChange,
  onForgot,
  onForgetMe,
  onSubmit,
}: AuthPhoneLoginPanelProps) {
  const resolvedSendCodeLabel =
    codeCountdown > 0
      ? retryCodeLabel(codeCountdown)
      : codeSending
        ? sendingCodeLabel
        : sendCodeDisabled
          ? verificationPendingLabel
          : sendCodeLabel;

  return (
    <AuthFlowForm
      onSubmit={onSubmit}
      input={
        <>
          {tabs}
          <div className="vx-auth-field-stack">
            <div className="vx-auth-phone-row">
              <AuthField
                label={phoneLabel}
                name={phoneName}
                type="tel"
                placeholder={phonePlaceholder}
                icon="phone"
                value={phone}
                error={errors?.phone}
                autoComplete="tel"
                autoFocus
                disabled={loading}
                onChange={onChangePhone}
              />
            </div>

            <div className="vx-auth-code-field-wrap">
              <div className="vx-auth-code-row">
                <AuthField
                  label={codeLabel}
                  name={codeName}
                  type="text"
                  placeholder={codePlaceholder}
                  icon="shield"
                  value={code}
                  error={errors?.code}
                  autoComplete="one-time-code"
                  disabled={loading}
                  onChange={onChangeCode}
                />
                <button
                  type="button"
                  className="vx-auth-send-code"
                  onClick={onSendCode}
                  disabled={loading || codeSending || codeCountdown > 0 || sendCodeDisabled}
                >
                  {resolvedSendCodeLabel}
                </button>
              </div>
            </div>

            <AuthLoginOptions
              {...options}
              disabled={loading}
              rememberChecked={rememberChecked}
              agreementChecked={agreementChecked}
              onRememberChange={onRememberChange}
              onAgreementChange={onAgreementChange}
              onForgot={onForgot}
              onForgetMe={onForgetMe}
            />
          </div>
        </>
      }
      primary={
        <>
          {turnstile}
          {errors?.form ? <p className="vx-auth-error vx-auth-form-error">{errors.form}</p> : null}
          <AuthPrimaryButton
            loading={loading}
            disabled={primaryDisabled}
            label={submitLabel}
            loadingLabel={submitLoadingLabel}
            disabledLabel={primaryDisabledLabel}
          />
        </>
      }
      social={social}
      footer={footer}
      reserveSocialSpace={reserveSocialSpace}
      reserveFooterSpace={reserveFooterSpace}
    />
  );
}

export function AuthForgotPasswordPanel({
  email,
  error,
  loading,
  resetSent = false,
  backLabel = "返回登录",
  title = "重置密码",
  description = "输入注册邮箱，获取重置链接",
  sentTitle = "重置邮件已发送",
  sentDescription,
  sentHint = "未收到邮件？请检查垃圾邮件文件夹。",
  sentEmailFallback = "您的邮箱",
  sentActionLabel = "返回登录",
  emailLabel = "邮箱",
  emailName = "email",
  emailPlaceholder = "you@company.com",
  submitLabel = "获取重置链接",
  submitLoadingLabel = "生成中...",
  onBack,
  onChangeEmail,
  onSubmit,
}: AuthForgotPasswordPanelProps) {
  if (resetSent) {
    return (
      <>
        <AuthBackButton onClick={onBack}>{backLabel}</AuthBackButton>
        <div className="vx-auth-reset-done">
          <div className="vx-auth-check">✓</div>
          <h1>{sentTitle}</h1>
          <p>
            {sentDescription ?? (
              <>
                重置链接已发送至 <strong>{email || sentEmailFallback}</strong>，请在 15 分钟内查收并完成重置。
              </>
            )}
          </p>
          {sentHint ? <p className="vx-auth-reset-hint">{sentHint}</p> : null}
          <button type="button" onClick={onBack}>
            {sentActionLabel}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthBackButton onClick={onBack}>{backLabel}</AuthBackButton>
      <div className="vx-auth-panel-heading">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>

      <form onSubmit={onSubmit} autoComplete="on">
        <AuthField
          label={emailLabel}
          name={emailName}
          type="email"
          placeholder={emailPlaceholder}
          icon="mail"
          value={email}
          error={error}
          autoComplete="email"
          autoFocus
          disabled={loading}
          onChange={onChangeEmail}
        />
        <AuthPrimaryButton loading={loading} label={submitLabel} loadingLabel={submitLoadingLabel} />
      </form>
    </>
  );
}

function AuthBackButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="vx-auth-back" onClick={onClick}>
      <span>←</span>
      {children}
    </button>
  );
}

export function BrandProviderIcon({ provider, src }: { provider: AuthSocialProvider; src?: string }) {
  return (
    <img
      className="vx-auth-social-icon"
      src={src ?? DEFAULT_SOCIAL_ICON_SRC[provider]}
      alt=""
      aria-hidden="true"
      width={22}
      height={22}
      decoding="async"
      draggable={false}
      referrerPolicy="no-referrer"
    />
  );
}

function AuthVisualPanel({ visual }: { visual?: AuthVisualConfig }) {
  const title = visual?.title ?? DEFAULT_AUTH_VISUAL.title;
  const description = visual?.description ?? DEFAULT_AUTH_VISUAL.description;
  const statusText = visual?.statusText ?? DEFAULT_AUTH_VISUAL.statusText;
  const stats = visual?.stats ?? DEFAULT_AUTH_VISUAL.stats;

  return (
    <aside className="vx-auth-visual">
      <NodeGraph />
      <div className="vx-auth-grid" />
      <div className="vx-auth-scan" />
      <div className="vx-auth-fade" />

      {statusText ? (
        <div className="vx-auth-status">
          <span className="vx-auth-status-dot" />
          <span>{statusText}</span>
        </div>
      ) : null}

      <div className="vx-auth-copy">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {stats.length > 0 ? (
          <div className="vx-auth-stats">
            {stats.map((stat) => (
              <div key={`${stat.value}-${stat.label}`}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function AuthFieldIconGlyph({ icon }: { icon: AuthFieldIcon }) {
  if (icon === "lock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10V8a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M12 14v2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 6h4M11 18h2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "shield") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 19 6v5c0 4.5-2.8 8.2-7 10-4.2-1.8-7-5.5-7-10V6l7-3Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="m9.5 12 1.7 1.7 3.5-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="6" width="16" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m6.5 8.5 5.5 4 5.5-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function NodeGraph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const styles = getComputedStyle(document.documentElement);
    const nodeRgb = styles.getPropertyValue("--vx-color-auth-node-rgb").trim();
    const graphColor = (alpha: number) => `rgb(${nodeRgb} / ${alpha})`;
    let frame = 0;
    let width = 0;
    let height = 0;
    let nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number; phase: number }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(22, Math.floor((width * height) / 9000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;

      for (const node of nodes) {
        node.phase += 0.014;
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 100) {
          node.x += (dx / distance) * 0.5;
          node.y += (dy / distance) * 0.5;
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i];
          const second = nodes[j];
          if (!first || !second) continue;
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < 140) {
            context.strokeStyle = graphColor((1 - distance / 140) * 0.35);
            context.lineWidth = 0.6;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = (Math.sin(node.phase) + 1) / 2;
        context.fillStyle = graphColor(0.45 + pulse * 0.4);
        context.beginPath();
        context.arc(node.x, node.y, node.radius * (1 + pulse * 0.35), 0, Math.PI * 2);
        context.fill();
      }

      frame = window.requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="vx-auth-nodegraph" aria-hidden="true" />;
}
