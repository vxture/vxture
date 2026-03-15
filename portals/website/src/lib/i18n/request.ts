/**
 * i18n 请求工具
 * @package @vxture/website
 * @layer Presentation
 * @category I18n
 */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// 为了简化，我们在这里直接内联翻译内容
// 在生产环境中，你应该从文件系统加载翻译
const translations = {
  zh: {
    common: {
      title: "Vxture",
      description: "释放数据的无限潜力",
      nav: {
        home: "首页",
        products: "产品",
        solutions: "解决方案",
        cases: "案例",
        about: "关于我们"
      },
      footer: {
        copyright: "© 2026 Vxture. 保留所有权利。"
      },
      actions: {
        learnMore: "了解更多",
        contactUs: "联系我们",
        signUp: "注册",
        login: "登录"
      },
      errors: {
        required: "此字段为必填项",
        invalidEmail: "请输入有效的邮箱地址",
        invalidPassword: "密码长度至少为6位",
        generic: "发生错误，请稍后重试"
      },
      success: {
        operationCompleted: "操作成功"
      },
      loading: "加载中..."
    },
    auth: {
      login: {
        title: "登录",
        email: "邮箱",
        password: "密码",
        rememberMe: "记住我",
        forgotPassword: "忘记密码？",
        loginButton: "登录",
        signupLink: "没有账号？立即注册",
        success: "登录成功",
        error: "登录失败，请检查账号密码"
      },
      signup: {
        title: "注册",
        name: "姓名",
        email: "邮箱",
        password: "密码",
        confirmPassword: "确认密码",
        signupButton: "注册",
        loginLink: "已有账号？立即登录",
        success: "注册成功",
        error: "注册失败，请检查信息"
      },
      logout: "退出登录"
    },
    home: {
      hero: {
        title: "释放数据的无限潜力",
        subtitle: "面向政企复杂业务场景，构建数据驱动的业务智能体系",
        cta: "开启探索之旅"
      },
      features: {
        title: "核心功能",
        description: "强大的功能，简单的体验"
      },
      solutions: {
        title: "解决方案",
        description: "为不同行业提供定制化方案"
      },
      cases: {
        title: "成功案例",
        description: "看看我们的客户如何成功"
      },
      cta: {
        title: "准备好开始了吗？",
        description: "立即注册，免费试用",
        button: "立即注册"
      }
    }
  },
  en: {
    common: {
      title: "Vxture",
      description: "Unleash the Infinite Potential of Data",
      nav: {
        home: "Home",
        products: "Products",
        solutions: "Solutions",
        cases: "Cases",
        about: "About"
      },
      footer: {
        copyright: "© 2026 Vxture. All rights reserved."
      },
      actions: {
        learnMore: "Learn More",
        contactUs: "Contact Us",
        signUp: "Sign Up",
        login: "Login"
      },
      errors: {
        required: "This field is required",
        invalidEmail: "Please enter a valid email address",
        invalidPassword: "Password must be at least 6 characters",
        generic: "An error occurred, please try again later"
      },
      success: {
        operationCompleted: "Operation completed successfully"
      },
      loading: "Loading..."
    },
    auth: {
      login: {
        title: "Login",
        email: "Email",
        password: "Password",
        rememberMe: "Remember Me",
        forgotPassword: "Forgot Password?",
        loginButton: "Login",
        signupLink: "Don't have an account? Sign up now",
        success: "Login successful",
        error: "Login failed, please check your credentials"
      },
      signup: {
        title: "Sign Up",
        name: "Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        signupButton: "Sign Up",
        loginLink: "Already have an account? Login now",
        success: "Sign up successful",
        error: "Sign up failed, please check your information"
      },
      logout: "Logout"
    },
    home: {
      hero: {
        title: "Unleash the Infinite Potential of Data",
        subtitle: "Building data-driven business intelligence systems for complex government and enterprise scenarios",
        cta: "Start Your Journey"
      },
      features: {
        title: "Core Features",
        description: "Powerful features, simple experience"
      },
      solutions: {
        title: "Solutions",
        description: "Customized solutions for different industries"
      },
      cases: {
        title: "Success Stories",
        description: "See how our customers succeed"
      },
      cta: {
        title: "Ready to Get Started?",
        description: "Sign up now for a free trial",
        button: "Sign Up Now"
      }
    }
  }
};

export default getRequestConfig(async ({ locale }) => {
  // 使用内联翻译，避免构建时的路径问题
  const resolvedLocale = locale || 'en';
  const messages = translations[resolvedLocale as keyof typeof translations] || translations.en;

  return {
    locale: resolvedLocale,
    messages,
    routing,
  };
});
