import {
  BarChart3,
  Network,
  Database,
  Brain,
  Sparkles,
  Cloud,
  Code2,
  Cog,
  ShieldCheck,
  Lock,
  CheckCircle,
  Zap,
  Mail,
  Phone,
  Layers,
  Users,
  RefreshCw,
  Calendar,
  Bot,
  Globe,
  Github,
  MessageCircle,
} from 'lucide-react';

import type { IconToken } from '@/constants/icon.tokens';

export const iconMap: Record<IconToken, React.ComponentType<any>> = {
  /* 数据 / 分析 */
  data: Database,
  chart: BarChart3,
  graph: Network,

  /* AI / 智能 */
  ai: Brain,
  brain: Brain,
  spark: Sparkles,

  /* 系统 / 平台 */
  cloud: Cloud,
  code: Code2,
  cog: Cog,
  layers: Layers,

  /* 安全 / 治理 */
  shield: ShieldCheck,
  lock: Lock,
  check: CheckCircle,

  /* 方案 / 业务能力 */
  users: Users,
  calendar: Calendar,
  refresh: RefreshCw,
  bot: Bot,

  /* UI / 通用交互 */
  lightning: Zap,
  globe: Globe,

  /* 联系方式 / 外部 */
  mail: Mail,
  phone: Phone,
  github: Github,
  wechat: MessageCircle,
};
