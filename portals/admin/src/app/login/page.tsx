"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  AuthChromeFooter,
  AuthChromeHeader,
  AuthLoginTemplate,
  AuthPasswordLoginPanel,
  AuthPhoneLoginPanel,
  AuthTabs,
  Button,
  useTheme,
  type AuthLoginTab,
} from "@vxture/design-system";
import {
  AdminBffError,
  getCaptchaChallenge,
  sendAdminPhoneCode,
} from "@/api/admin-bff";
import {
  AdminSessionProvider,
  useAdminSession,
} from "@/features/session/AdminSessionProvider";
import { useConsoleLocale, useConsoleTranslations } from "@/lib/console-intl";
import {
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from "@vxture/platform-browser";
import type { Locale, Theme } from "@vxture/shared";

const BG_SRC = "/images/login-bg-light.jpg";
const CAPTCHA_HANDLE_SIZE = 42;
const CAPTCHA_PIECE_SIZE = 42;
const CAPTCHA_TOLERANCE = 10;
const CAPTCHA_RETURN_MS = 220;
const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const REMEMBER_LOGIN_KEY = "vxture-admin-login-remember";
const REMEMBER_IDENTIFIER_KEY = "vxture-admin-login-identifier";

function resolveSafeRedirect(next: string | null) {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return "/";
  }

  return next;
}

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithPhone, status } = useAdminSession();
  const t = useConsoleTranslations("login");

  const [screen, setScreen] = useState<AuthLoginTab>("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneCodeError, setPhoneCodeError] = useState("");
  const [rememberLogin, setRememberLogin] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaOffset, setCaptchaOffset] = useState(0);
  const [captchaDragging, setCaptchaDragging] = useState(false);
  const [captchaReturning, setCaptchaReturning] = useState(false);
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaTargetRatio, setCaptchaTargetRatio] = useState(0.6);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const pendingCredentialsRef = useRef({ identifier: "", password: "" });
  const phoneCodeTimerRef = useRef<number | null>(null);
  const captchaTokenRef = useRef("");
  const captchaSliderRef = useRef<HTMLDivElement | null>(null);
  const captchaHandleRef = useRef<HTMLButtonElement | null>(null);
  const captchaPieceRef = useRef<HTMLDivElement | null>(null);
  const captchaProgressRef = useRef<HTMLDivElement | null>(null);
  const captchaMaxRef = useRef(0);
  const captchaOffsetRef = useRef(0);
  const captchaAnimationFrameRef = useRef<number | null>(null);
  const loading = submitting || status === "loading";

  useEffect(() => {
    const shouldRemember =
      window.localStorage.getItem(REMEMBER_LOGIN_KEY) === "1";
    const savedIdentifier = window.localStorage.getItem(
      REMEMBER_IDENTIFIER_KEY,
    );

    setRememberLogin(shouldRemember);
    if (shouldRemember && savedIdentifier) {
      setIdentifier(savedIdentifier);
      setPhone(savedIdentifier);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (captchaAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(captchaAnimationFrameRef.current);
      }
      if (phoneCodeTimerRef.current !== null) {
        window.clearInterval(phoneCodeTimerRef.current);
      }
    };
  }, []);

  function captchaGeometry() {
    const slider = captchaSliderRef.current;
    if (!slider) return { max: 0, target: 0 };
    const max = Math.max(
      0,
      slider.getBoundingClientRect().width - CAPTCHA_HANDLE_SIZE,
    );
    return {
      max,
      target: Math.round(max * captchaTargetRatio),
    };
  }

  function applyCaptchaOffset(value: number) {
    const max = captchaMaxRef.current;
    captchaOffsetRef.current = value;

    if (captchaAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(captchaAnimationFrameRef.current);
    }

    captchaAnimationFrameRef.current = window.requestAnimationFrame(() => {
      const transform = `translate3d(${value}px, 0, 0)`;
      if (captchaHandleRef.current) {
        captchaHandleRef.current.style.transform = transform;
      }
      if (captchaPieceRef.current) {
        captchaPieceRef.current.style.transform = transform;
      }
      if (captchaProgressRef.current) {
        captchaProgressRef.current.style.transform = `scaleX(${max ? value / max : 0})`;
      }
    });
  }

  function resetCaptcha() {
    setCaptchaOffset(0);
    setCaptchaDragging(false);
    setCaptchaReturning(false);
    setCaptchaSolved(false);
    captchaOffsetRef.current = 0;
    captchaMaxRef.current = 0;
    captchaTokenRef.current = "";
    applyCaptchaOffset(0);
  }

  function handleCaptchaPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (captchaSolved || loading) return;
    const { max } = captchaGeometry();
    captchaMaxRef.current = max;
    captchaOffsetRef.current = captchaOffset;
    setCaptchaReturning(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    setCaptchaDragging(true);
    setError("");
  }

  function handleCaptchaPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!captchaDragging || captchaSolved) return;
    const slider = captchaSliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const max = captchaMaxRef.current || captchaGeometry().max;
    const next = Math.min(
      max,
      Math.max(0, event.clientX - rect.left - CAPTCHA_HANDLE_SIZE / 2),
    );
    applyCaptchaOffset(next);
  }

  function handleCaptchaPointerEnd() {
    if (!captchaDragging || captchaSolved) return;
    setCaptchaDragging(false);
    const { max, target } = captchaGeometry();
    captchaMaxRef.current = max;
    const offset = captchaOffsetRef.current;

    if (Math.abs(offset - target) <= CAPTCHA_TOLERANCE) {
      setCaptchaSolved(true);
      setCaptchaOffset(target);
      applyCaptchaOffset(target);
      setError("");
      const position = max > 0 ? offset / max : 0;
      void continueSignIn(captchaTokenRef.current, position);
      return;
    }

    setCaptchaReturning(true);
    setCaptchaOffset(0);
    applyCaptchaOffset(0);
    window.setTimeout(() => setCaptchaReturning(false), CAPTCHA_RETURN_MS);
  }

  function validateLoginForm() {
    const credentials = {
      identifier: identifier.trim(),
      password,
    };

    if (!credentials.identifier || !credentials.password) {
      setError(t("errors.required"));
      return false;
    }

    if (!acceptedTerms) {
      setError(t("errors.terms"));
      return false;
    }

    pendingCredentialsRef.current = credentials;
    return true;
  }

  function startPhoneCodeCountdown() {
    if (phoneCodeTimerRef.current !== null) {
      window.clearInterval(phoneCodeTimerRef.current);
    }

    setCodeCountdown(60);
    phoneCodeTimerRef.current = window.setInterval(() => {
      setCodeCountdown((seconds) => {
        if (seconds <= 1) {
          if (phoneCodeTimerRef.current !== null) {
            window.clearInterval(phoneCodeTimerRef.current);
            phoneCodeTimerRef.current = null;
          }
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  }

  function validatePhoneValue(value: string) {
    if (!PHONE_PATTERN.test(value)) {
      setPhoneError(t("errors.phoneInvalid"));
      return false;
    }

    setPhoneError("");
    return true;
  }

  function validatePhoneLoginForm() {
    const normalizedPhone = phone.trim().replace(/\s+/g, "");
    const normalizedCode = phoneCode.trim();
    let valid = true;

    if (!PHONE_PATTERN.test(normalizedPhone)) {
      setPhoneError(t("errors.phoneInvalid"));
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setPhoneCodeError(t("errors.codeInvalid"));
      valid = false;
    } else {
      setPhoneCodeError("");
    }

    if (!acceptedTerms) {
      setError(t("errors.terms"));
      valid = false;
    }

    if (valid) {
      setPhone(normalizedPhone);
      setPhoneCode(normalizedCode);
    }

    return valid;
  }

  function handleAuthTabChange(nextScreen: AuthLoginTab) {
    setScreen(nextScreen);
    setError("");
    setPhoneError("");
    setPhoneCodeError("");
  }

  function handleRememberLoginChange(checked: boolean) {
    setRememberLogin(checked);
    if (!checked) {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
      window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
    }
  }

  function persistRememberedLogin(value: string) {
    if (rememberLogin) {
      window.localStorage.setItem(REMEMBER_LOGIN_KEY, "1");
      window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, value);
      return;
    }

    window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
    window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
  }

  async function handleSendPhoneCode() {
    const normalizedPhone = phone.trim().replace(/\s+/g, "");
    setError("");
    setPhoneCodeError("");

    if (!validatePhoneValue(normalizedPhone)) {
      return;
    }

    setCodeSending(true);
    try {
      await sendAdminPhoneCode(normalizedPhone);
      setPhone(normalizedPhone);
      startPhoneCodeCountdown();
    } catch (error) {
      if (error instanceof AdminBffError && error.status === 429) {
        setError(error.message || t("errors.tooManyAttempts"));
      } else if (
        error instanceof AdminBffError &&
        (error.status === 502 || error.status === 503)
      ) {
        setError(t("errors.unavailable"));
      } else if (error instanceof AdminBffError && error.message) {
        setError(error.message);
      } else {
        setError(t("errors.unavailable"));
      }
    } finally {
      setCodeSending(false);
    }
  }

  async function continueSignIn(captchaToken: string, captchaPosition: number) {
    setError("");
    setSubmitting(true);

    try {
      const credentials = pendingCredentialsRef.current;
      await signIn(
        credentials.identifier,
        credentials.password,
        captchaToken,
        captchaPosition,
      );
      persistRememberedLogin(credentials.identifier);

      const PasswordCredentialConstructor = (
        window as Window & {
          PasswordCredential?: new (data: {
            id: string;
            password: string;
          }) => Credential;
        }
      ).PasswordCredential;
      if (PasswordCredentialConstructor) {
        try {
          const cred = new PasswordCredentialConstructor({
            id: credentials.identifier,
            password: credentials.password,
          });
          await navigator.credentials.store(cred);
        } catch {
          // 隐私模式或用户拒绝时静默忽略
        }
      }

      router.replace(resolveSafeRedirect(searchParams.get("next")));
    } catch (error) {
      if (error instanceof AdminBffError && error.status === 429) {
        setError(error.message || t("errors.tooManyAttempts"));
      } else if (error instanceof AdminBffError && error.status === 401) {
        setError(t("errors.invalid"));
      } else if (error instanceof AdminBffError && error.status === 503) {
        setError(t("errors.unavailable"));
      } else if (error instanceof AdminBffError && error.message) {
        setError(error.message);
      } else {
        setError(t("errors.invalid"));
      }
    } finally {
      setSubmitting(false);
      setCaptchaOpen(false);
      resetCaptcha();
    }
  }

  async function handleForgetMe() {
    setIdentifier("");
    setPassword("");
    setPhone("");
    setPhoneCode("");
    setPhoneError("");
    setPhoneCodeError("");
    setRememberLogin(false);
    window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
    window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
    if (navigator.credentials?.preventSilentAccess) {
      try {
        await navigator.credentials.preventSilentAccess();
      } catch {
        // 静默忽略
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (screen === "phone") {
      if (!validatePhoneLoginForm()) return;

      setError("");
      setSubmitting(true);

      try {
        const normalizedPhone = phone.trim().replace(/\s+/g, "");
        await signInWithPhone(normalizedPhone, phoneCode.trim());
        persistRememberedLogin(normalizedPhone);
        router.replace(resolveSafeRedirect(searchParams.get("next")));
      } catch (error) {
        if (error instanceof AdminBffError && error.status === 429) {
          setError(error.message || t("errors.tooManyAttempts"));
        } else if (error instanceof AdminBffError && error.status === 400) {
          setError(t("errors.phoneCodeInvalid"));
        } else if (error instanceof AdminBffError && error.status === 401) {
          setError(t("errors.invalid"));
        } else if (
          error instanceof AdminBffError &&
          (error.status === 502 || error.status === 503)
        ) {
          setError(t("errors.unavailable"));
        } else if (error instanceof AdminBffError && error.message) {
          setError(error.message);
        } else {
          setError(t("errors.invalid"));
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!validateLoginForm()) return;

    resetCaptcha();
    setSubmitting(true);
    setError("");

    try {
      const challenge = await getCaptchaChallenge();
      captchaTokenRef.current = challenge.token;
      setCaptchaTargetRatio(challenge.targetRatio);
      setCaptchaOpen(true);
    } catch (error) {
      if (error instanceof AdminBffError && error.status === 503) {
        setError(t("errors.unavailable"));
      } else {
        setError(t("errors.captchaUnavailable"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLoginTemplate
      className="vx-admin-auth-page"
      pageBackgroundImage={BG_SRC}
      title={t("card.title")}
      visual={{
        title: t("hero.title"),
        description: t("hero.description"),
        statusText: t("hero.eyebrow"),
        stats: [
          { value: "Admin", label: t("hero.signals.capability") },
          { value: "RBAC", label: t("hero.signals.tenant") },
          { value: "BFF", label: t("hero.signals.session") },
        ],
      }}
      overlay={
        captchaOpen ? (
          <AdminCaptchaOverlay
            targetRatio={captchaTargetRatio}
            offset={captchaOffset}
            max={captchaMaxRef.current}
            dragging={captchaDragging}
            returning={captchaReturning}
            solved={captchaSolved}
            loading={loading}
            sliderRef={captchaSliderRef}
            handleRef={captchaHandleRef}
            pieceRef={captchaPieceRef}
            progressRef={captchaProgressRef}
            dragLabel={t("form.dragToVerify")}
            closeLabel={t("form.closeVerification")}
            title={t("form.humanVerification")}
            solvedLabel={t("form.verificationPassed")}
            onClose={() => {
              setCaptchaOpen(false);
              resetCaptcha();
            }}
            onPointerDown={handleCaptchaPointerDown}
            onPointerMove={handleCaptchaPointerMove}
            onPointerEnd={handleCaptchaPointerEnd}
          />
        ) : null
      }
      header={<AuthHeader />}
      footer={<AuthFooter />}
    >
      {screen === "login" ? (
        <AuthPasswordLoginPanel
          tabs={
            <AuthTabs
              active={screen}
              onChange={handleAuthTabChange}
              passwordLabel={t("form.passwordLogin")}
              phoneLabel={t("form.phoneLogin")}
            />
          }
          identifier={identifier}
          password={password}
          rememberChecked={rememberLogin}
          agreementChecked={acceptedTerms}
          errors={{ form: error }}
          loading={loading}
          identifierLabel={t("form.account")}
          identifierPlaceholder={t("form.accountPlaceholder")}
          passwordLabel={t("form.password")}
          passwordPlaceholder={t("form.passwordPlaceholder")}
          submitLabel={t("form.submit")}
          submitLoadingLabel={t("form.submitting")}
          options={{
            rememberLabel: t("form.rememberLogin"),
            agreementPrefix: t("form.acceptPrefix"),
            termsLabel: t("form.terms"),
            agreementJoiner: t("form.acceptJoiner"),
            privacyLabel: t("form.privacy"),
            forgotLabel: t("form.forgotPassword"),
            forgotHref: "#forgot-password",
            forgetMeLabel: t("form.forgetMe"),
          }}
          reserveSocialSpace
          reserveFooterSpace
          onChangeIdentifier={(value) => {
            setIdentifier(value);
            setError("");
          }}
          onChangePassword={(value) => {
            setPassword(value);
            setError("");
          }}
          onRememberChange={handleRememberLoginChange}
          onAgreementChange={(checked) => {
            setAcceptedTerms(checked);
            setError("");
          }}
          onForgetMe={handleForgetMe}
          onSubmit={handleSubmit}
        />
      ) : (
        <AuthPhoneLoginPanel
          tabs={
            <AuthTabs
              active={screen}
              onChange={handleAuthTabChange}
              passwordLabel={t("form.passwordLogin")}
              phoneLabel={t("form.phoneLogin")}
            />
          }
          phone={phone}
          code={phoneCode}
          rememberChecked={rememberLogin}
          agreementChecked={acceptedTerms}
          errors={{ phone: phoneError, code: phoneCodeError, form: error }}
          loading={loading}
          codeSending={codeSending}
          codeCountdown={codeCountdown}
          phoneLabel={t("form.phone")}
          phonePlaceholder={t("form.phonePlaceholder")}
          codeLabel={t("form.code")}
          codeName="phone-code"
          codePlaceholder={t("form.codePlaceholder")}
          sendCodeLabel={t("form.sendCode")}
          sendingCodeLabel={t("form.sendingCode")}
          retryCodeLabel={(seconds) => t("form.retryCode", { seconds })}
          submitLabel={t("form.submit")}
          submitLoadingLabel={t("form.submitting")}
          options={{
            rememberLabel: t("form.rememberLogin"),
            agreementPrefix: t("form.acceptPrefix"),
            termsLabel: t("form.terms"),
            agreementJoiner: t("form.acceptJoiner"),
            privacyLabel: t("form.privacy"),
            forgotLabel: t("form.forgotPassword"),
            forgotHref: "#forgot-password",
            forgetMeLabel: t("form.forgetMe"),
          }}
          reserveSocialSpace
          reserveFooterSpace
          onChangePhone={(value) => {
            setPhone(value);
            setPhoneError("");
            setError("");
          }}
          onChangeCode={(value) => {
            setPhoneCode(value.replace(/\D/g, "").slice(0, 6));
            setPhoneCodeError("");
            setError("");
          }}
          onSendCode={handleSendPhoneCode}
          onRememberChange={handleRememberLoginChange}
          onAgreementChange={(checked) => {
            setAcceptedTerms(checked);
            setError("");
          }}
          onForgetMe={handleForgetMe}
          onSubmit={handleSubmit}
        />
      )}
    </AuthLoginTemplate>
  );
}

function AuthHeader() {
  const locale = useConsoleLocale();
  const { theme, setTheme } = useTheme();
  const isZh = locale === "zh-CN";

  return (
    <AuthChromeHeader
      brandHref="/"
      brandLogoSrc="/brand/vxture-logo-white.png"
      brandLogoAlt="vxture.ai"
      brandLabel="vxture.ai"
      currentLocale={locale}
      currentTheme={theme}
      localeButtonLabel={isZh ? "选择语言" : "Select language"}
      localePanelLabel={isZh ? "语言选择" : "Language selection"}
      lightThemeLabel={isZh ? "浅色模式" : "Light mode"}
      darkThemeLabel={isZh ? "深色模式" : "Dark mode"}
      onLocaleChange={(nextLocale: Locale) => {
        setGlobalLocalePreference(nextLocale);
      }}
      onThemeChange={(nextTheme) => {
        setTheme(nextTheme);
        setGlobalThemePreference(nextTheme as Theme);
      }}
    />
  );
}

function AuthFooter() {
  const t = useConsoleTranslations("login");

  return (
    <AuthChromeFooter
      copyright={t("footer.copyright")}
      legalLabel="Legal links"
      links={[
        { href: "/legal/terms", label: t("footer.terms") },
        { href: "/legal/privacy", label: t("footer.privacy") },
        { href: "/legal/cookies", label: t("footer.cookies") },
      ]}
    />
  );
}

function AdminCaptchaOverlay({
  targetRatio,
  offset,
  max,
  dragging,
  returning,
  solved,
  loading,
  sliderRef,
  handleRef,
  pieceRef,
  progressRef,
  dragLabel,
  closeLabel,
  title,
  solvedLabel,
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
}: {
  targetRatio: number;
  offset: number;
  max: number;
  dragging: boolean;
  returning: boolean;
  solved: boolean;
  loading: boolean;
  sliderRef: RefObject<HTMLDivElement | null>;
  handleRef: RefObject<HTMLButtonElement | null>;
  pieceRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLDivElement | null>;
  dragLabel: string;
  closeLabel: string;
  title: string;
  solvedLabel: string;
  onClose: () => void;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerEnd: () => void;
}) {
  return (
    <div
      className="auth-captcha-modal"
      role="dialog"
      aria-modal="true"
      aria-label={dragLabel}
    >
      <div className="auth-captcha-modal__backdrop" />
      <div className="auth-captcha-modal__panel">
        <Button
          variant="ghost"
          size="icon"
          className="auth-captcha-modal__close"
          aria-label={closeLabel}
          onClick={onClose}
          disabled={loading}
        >
          ×
        </Button>
        <div className="auth-captcha-modal__header">
          <strong>{title}</strong>
          <span>{dragLabel}</span>
        </div>
        <div
          className={[
            "auth-captcha",
            dragging ? "auth-captcha--dragging" : "",
            returning ? "auth-captcha--returning" : "",
            solved ? "auth-captcha--solved" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="auth-captcha__image" aria-hidden="true">
            <div
              className="auth-captcha__target"
              style={{
                left: `calc((100% - ${CAPTCHA_PIECE_SIZE}px) * ${targetRatio})`,
              }}
            />
            <div
              ref={pieceRef}
              className="auth-captcha__piece"
              style={{ transform: `translate3d(${offset}px, 0, 0)` }}
            />
          </div>
          <div className="auth-captcha__slider" ref={sliderRef}>
            <div
              ref={progressRef}
              className="auth-captcha__progress"
              style={{ transform: `scaleX(${max ? offset / max : 0})` }}
              aria-hidden="true"
            />
            <span className="auth-captcha__hint">
              {solved ? solvedLabel : dragLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              ref={handleRef}
              className="auth-captcha__handle"
              style={{ transform: `translate3d(${offset}px, 0, 0)` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              aria-label={dragLabel}
              disabled={solved || loading}
            >
              <span aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AdminSessionProvider>
      <LoginScreen />
    </AdminSessionProvider>
  );
}
