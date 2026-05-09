import { useEffect, useRef, useState, type ReactNode } from "react";
import { LOCALE_CONFIGS, SUPPORTED_LOCALES, type Locale, type Theme } from "@vxture/shared";
import { Icon } from "../../icons";
import type { IconName } from "../../icons";
import { cn } from "../../utils";
import { Avatar, AvatarFallback, AvatarImage, Popover, PopoverContent, PopoverTrigger } from "../ui";
import { useFullscreen } from "../layout/fullscreen";
import type { FullscreenMode } from "../../types";
import type { Density } from "../../density";

export type ShellFontSizePreference = "small" | "default" | "large";
export type ShellThemePreference = Theme | "system";

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

export interface ShellIconButtonProps {
  icon: IconName;
  label: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  iconClassName?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export interface ShellBrandProps {
  href?: string;
  logoSrc?: string;
  logoAlt?: string;
  label?: ReactNode;
  className?: string;
  logoClassName?: string;
  labelClassName?: string;
}

export interface ShellLocaleSwitcherProps {
  currentLocale: Locale;
  options?: LocaleSelectOption[];
  buttonLabel?: string;
  panelLabel?: string;
  align?: "start" | "end";
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  popoverClassName?: string;
  onLocaleChange: (locale: Locale) => void;
}

export interface ShellThemeToggleProps {
  currentTheme?: ShellThemePreference | string;
  buttonLabel?: string;
  lightLabel?: string;
  darkLabel?: string;
  className?: string;
  activeClassName?: string;
  onThemeChange: (theme: "light" | "dark") => void;
}

export interface ShellFullscreenToggleProps {
  targetId: string;
  mode?: FullscreenMode;
  lockScroll?: boolean;
  enterLabel?: string;
  exitLabel?: string;
  className?: string;
  activeClassName?: string;
  getTargetElement?: () => HTMLElement | null;
}

export interface ShellPreferenceLabels {
  title?: ReactNode;
  locale?: ReactNode;
  theme?: ReactNode;
  density?: ReactNode;
  fontSize?: ReactNode;
  themeOptions?: Partial<Record<ShellThemePreference, ReactNode>>;
  densityOptions?: Partial<Record<Density, ReactNode>>;
  fontSizeOptions?: Partial<Record<ShellFontSizePreference, ReactNode>>;
}

export interface ShellPreferencePanelProps {
  locale: Locale;
  localeOptions?: LocaleSelectOption[];
  theme: ShellThemePreference;
  density?: Density;
  fontSize?: ShellFontSizePreference;
  labels?: ShellPreferenceLabels;
  showDensity?: boolean;
  showFontSize?: boolean;
  className?: string;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (theme: ShellThemePreference) => void;
  onDensityChange?: (density: Density) => void;
  onFontSizeChange?: (fontSize: ShellFontSizePreference) => void;
}

export interface ShellUserBadge {
  key: string;
  label: ReactNode;
}

export interface ShellUserMenuUser {
  displayName: string;
  uniqueLine?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  avatarFallback?: string;
  meta?: ReactNode;
  badges?: ShellUserBadge[];
}

export interface ShellUserMenuAction {
  key: string;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
}

export interface ShellUserMenuPortalReturn {
  label: ReactNode;
  onReturn: () => void;
  dismissLabel?: string;
  onDismiss?: () => void;
}

export interface ShellUserMenuProps {
  user: ShellUserMenuUser;
  openLabel?: string;
  online?: boolean;
  settings?: ReactNode;
  portalReturn?: ShellUserMenuPortalReturn;
  actions?: ShellUserMenuAction[];
  triggerClassName?: string;
  contentClassName?: string;
  statusClassName?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export interface ShellLegalFooterLink {
  href: string;
  label: ReactNode;
}

export interface ShellLegalFooterProps {
  copyright?: ReactNode;
  links?: ShellLegalFooterLink[];
  legalLabel?: string;
  className?: string;
  innerClassName?: string;
  linksClassName?: string;
}

const DEFAULT_LOCALE_OPTIONS: LocaleSelectOption[] = SUPPORTED_LOCALES.map((locale) => ({
  locale,
  nativeName: LOCALE_CONFIGS[locale].nativeName,
  label: LOCALE_CONFIGS[locale].displayName,
  flag: LOCALE_CONFIGS[locale].flag,
}));

const DEFAULT_LEGAL_LINKS: ShellLegalFooterLink[] = [
  { href: "/legal/terms", label: "服务条款" },
  { href: "/legal/privacy", label: "隐私政策" },
  { href: "/legal/cookies", label: "Cookie 使用政策" },
];

const THEME_OPTIONS: readonly ShellThemePreference[] = ["system", "light", "dark"];
const DENSITY_OPTIONS: readonly Density[] = ["compact", "default", "comfortable"];
const FONT_SIZE_OPTIONS: readonly ShellFontSizePreference[] = ["small", "default", "large"];

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

export function ShellBrand({
  href = "/",
  logoSrc,
  logoAlt = "",
  label = "vxture.ai",
  className,
  logoClassName,
  labelClassName,
}: ShellBrandProps) {
  return (
    <a href={href} className={cn("vx-shell-brand", className)} aria-label={typeof label === "string" ? label : undefined}>
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={logoAlt}
          aria-hidden={logoAlt ? undefined : true}
          width={24}
          height={24}
          className={cn("vx-shell-brand__logo", logoClassName)}
          draggable={false}
        />
      ) : null}
      <span className={cn("vx-shell-brand__label", labelClassName)}>{label}</span>
    </a>
  );
}

export function ShellIconButton({
  icon,
  label,
  active = false,
  disabled = false,
  className,
  activeClassName,
  iconClassName,
  children,
  onClick,
}: ShellIconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn("vx-shell-tool-button", active && "vx-shell-tool-button--active", active && activeClassName, className)}
    >
      {children ?? <Icon name={icon} size="sm" className={iconClassName} />}
    </button>
  );
}

export function ShellLocaleSwitcher({
  currentLocale,
  options = DEFAULT_LOCALE_OPTIONS,
  buttonLabel = "选择语言",
  panelLabel = "语言选择",
  align = "end",
  className,
  buttonClassName,
  activeButtonClassName,
  popoverClassName,
  onLocaleChange,
}: ShellLocaleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("vx-shell-locale-switcher", className)}>
      <ShellIconButton
        icon="globe"
        label={buttonLabel}
        active={open}
        className={buttonClassName}
        activeClassName={activeButtonClassName}
        onClick={() => setOpen((value) => !value)}
      />
      {open ? (
        <div className={cn("vx-shell-locale-popover", `vx-shell-locale-popover--${align}`, popoverClassName)} aria-label={panelLabel}>
          <LocaleSelectPanel
            activeLocale={currentLocale}
            options={options}
            onSelect={(locale) => {
              setOpen(false);
              onLocaleChange(locale);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ShellThemeToggle({
  currentTheme = "light",
  buttonLabel,
  lightLabel = "浅色模式",
  darkLabel = "深色模式",
  className,
  activeClassName,
  onThemeChange,
}: ShellThemeToggleProps) {
  const activeTheme = currentTheme === "dark" ? "dark" : "light";
  const nextTheme = activeTheme === "dark" ? "light" : "dark";
  const resolvedLabel = buttonLabel ?? (nextTheme === "dark" ? darkLabel : lightLabel);

  return (
    <ShellIconButton
      icon={activeTheme === "dark" ? "sun" : "moon"}
      label={resolvedLabel}
      active={activeTheme === "dark"}
      className={className}
      activeClassName={activeClassName}
      onClick={() => onThemeChange(nextTheme)}
    />
  );
}

export function ShellFullscreenToggle({
  targetId,
  mode = "native",
  lockScroll = false,
  enterLabel = "显示器全屏",
  exitLabel = "退出全屏",
  className,
  activeClassName,
  getTargetElement,
}: ShellFullscreenToggleProps) {
  const { enter, exit, isFullscreen, mode: activeMode, targetId: activeTargetId } = useFullscreen();
  const active = isFullscreen && activeTargetId === targetId && activeMode === mode;

  return (
    <ShellIconButton
      icon={active ? "minimize" : "maximize"}
      label={active ? exitLabel : enterLabel}
      active={active}
      className={className}
      activeClassName={activeClassName}
      onClick={() => {
        if (active) {
          exit();
          return;
        }

        const target = getTargetElement?.() ?? (typeof document !== "undefined" ? document.documentElement : null);
        if (target) {
          enter(targetId, target, { mode, lockScroll });
        }
      }}
    />
  );
}

export function ShellPreferencePanel({
  locale,
  localeOptions = DEFAULT_LOCALE_OPTIONS,
  theme,
  density = "default",
  fontSize = "default",
  labels,
  showDensity = true,
  showFontSize = true,
  className,
  onLocaleChange,
  onThemeChange,
  onDensityChange,
  onFontSizeChange,
}: ShellPreferencePanelProps) {
  return (
    <div className={cn("vx-shell-preferences", className)}>
      {labels?.title ? <p className="vx-shell-preferences__title">{labels.title}</p> : null}
      <ShellPreferenceRow icon="globe" label={labels?.locale}>
        <div className="vx-shell-preferences__select-wrap">
          <select className="vx-shell-preferences__select" value={locale} onChange={(event) => onLocaleChange(event.target.value as Locale)}>
            {localeOptions.map((option) => (
              <option key={option.locale} value={option.locale}>
                {option.nativeName ?? option.label ?? option.locale}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" className="vx-shell-preferences__select-icon" />
        </div>
      </ShellPreferenceRow>

      <ShellPreferenceRow icon="sun" label={labels?.theme}>
        <ShellSegmentedOptions
          value={theme}
          options={THEME_OPTIONS}
          labels={{
            system: labels?.themeOptions?.system ?? "跟随系统",
            light: labels?.themeOptions?.light ?? "浅色",
            dark: labels?.themeOptions?.dark ?? "深色",
          }}
          onChange={onThemeChange}
        />
      </ShellPreferenceRow>

      {showDensity ? (
        <ShellPreferenceRow icon="rows" label={labels?.density}>
          <ShellSegmentedOptions
            value={density}
            options={DENSITY_OPTIONS}
            labels={{
              compact: labels?.densityOptions?.compact ?? "紧凑",
              default: labels?.densityOptions?.default ?? "默认",
              comfortable: labels?.densityOptions?.comfortable ?? "宽松",
            }}
            onChange={(value) => onDensityChange?.(value)}
          />
        </ShellPreferenceRow>
      ) : null}

      {showFontSize ? (
        <ShellPreferenceRow icon="settings" label={labels?.fontSize}>
          <ShellSegmentedOptions
            value={fontSize}
            options={FONT_SIZE_OPTIONS}
            labels={{
              small: labels?.fontSizeOptions?.small ?? "小",
              default: labels?.fontSizeOptions?.default ?? "默认",
              large: labels?.fontSizeOptions?.large ?? "大",
            }}
            onChange={(value) => onFontSizeChange?.(value)}
          />
        </ShellPreferenceRow>
      ) : null}
    </div>
  );
}

export function ShellUserMenu({
  user,
  openLabel = "用户菜单",
  online = true,
  settings,
  portalReturn,
  actions = [],
  triggerClassName,
  contentClassName,
  statusClassName,
  align = "end",
  sideOffset = 10,
}: ShellUserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("vx-shell-user-trigger", triggerClassName)}
          aria-label={openLabel}
          title={openLabel}
        >
          <ShellUserAvatar user={user} />
          {online ? <span className={cn("vx-shell-user-trigger__status", statusClassName)} /> : null}
        </button>
      </PopoverTrigger>

      <PopoverContent align={align} sideOffset={sideOffset} className={cn("vx-shell-user-menu", contentClassName)}>
        <div className="vx-shell-user-menu__profile">
          <ShellUserAvatar user={user} size="lg" />
          <div className="vx-shell-user-menu__identity">
            <p className="vx-shell-user-menu__name">{user.displayName}</p>
            {user.uniqueLine ? <p className="vx-shell-user-menu__line">{user.uniqueLine}</p> : null}
            {user.meta ? <p className="vx-shell-user-menu__meta">{user.meta}</p> : null}
          </div>
        </div>

        {user.badges && user.badges.length > 0 ? (
          <div className="vx-shell-user-menu__badges">
            {user.badges.map((badge) => (
              <span key={badge.key} className="vx-shell-user-badge">{badge.label}</span>
            ))}
          </div>
        ) : null}

        {portalReturn ? (
          <>
            <div className="vx-shell-user-menu__separator" />
            <div className="vx-shell-user-menu__section vx-shell-user-menu__return">
              <button
                type="button"
                className="vx-shell-user-menu__action vx-shell-user-menu__action--return"
                onClick={() => {
                  setOpen(false);
                  portalReturn.onReturn();
                }}
              >
                <Icon name="arrow-left" className="vx-shell-user-menu__action-icon" />
                <span>{portalReturn.label}</span>
              </button>
              {portalReturn.onDismiss ? (
                <button
                  type="button"
                  className="vx-shell-user-menu__dismiss"
                  aria-label={portalReturn.dismissLabel ?? "关闭"}
                  onClick={portalReturn.onDismiss}
                >
                  <Icon name="x" size="xs" />
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {settings ? (
          <>
            <div className="vx-shell-user-menu__separator" />
            <div className="vx-shell-user-menu__section">{settings}</div>
          </>
        ) : null}

        {actions.length > 0 ? (
          <>
            <div className="vx-shell-user-menu__separator" />
            <div className="vx-shell-user-menu__section">
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="vx-shell-user-menu__action"
                  disabled={action.disabled}
                  onClick={async () => {
                    setOpen(false);
                    await action.onClick();
                  }}
                >
                  {action.icon ? <Icon name={action.icon} className="vx-shell-user-menu__action-icon" /> : null}
                  {action.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function ShellLegalFooter({
  copyright = "© 2026 vxture.ai. All rights reserved.",
  links = DEFAULT_LEGAL_LINKS,
  legalLabel = "Legal links",
  className,
  innerClassName,
  linksClassName,
}: ShellLegalFooterProps) {
  return (
    <footer className={cn("vx-shell-legal-footer", className)}>
      <div className={cn("vx-shell-legal-footer__inner", innerClassName)}>
        <span>{copyright}</span>
        <nav className={cn("vx-shell-legal-footer__links", linksClassName)} aria-label={legalLabel}>
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

function ShellUserAvatar({ user, size = "md" }: { user: ShellUserMenuUser; size?: "md" | "lg" }) {
  const fallback = user.avatarFallback ?? user.displayName.slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn("vx-shell-user-avatar", size === "lg" && "vx-shell-user-avatar--lg")}>
      {user.avatarSrc ? <AvatarImage className="vx-shell-user-avatar__image" src={user.avatarSrc} alt={user.avatarAlt ?? user.displayName} /> : null}
      <AvatarFallback className="vx-shell-user-avatar__fallback">{fallback}</AvatarFallback>
    </Avatar>
  );
}

function ShellPreferenceRow({ icon, label, children }: { icon: IconName; label?: ReactNode; children: ReactNode }) {
  return (
    <div className="vx-shell-preferences__row">
      <span className="vx-shell-preferences__icon" title={typeof label === "string" ? label : undefined} aria-hidden={label ? undefined : true}>
        <Icon name={icon} size="sm" />
      </span>
      <div className="vx-shell-preferences__control">{children}</div>
    </div>
  );
}

function ShellSegmentedOptions<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, ReactNode>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="vx-shell-segmented" role="group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`vx-shell-segmented__item${value === option ? " vx-shell-segmented__item--active" : ""}`}
          onClick={() => onChange(option)}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
