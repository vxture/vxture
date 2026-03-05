/**
 * icon-registry.ts - 图标注册中心
 * @package @vxture/design-system
 *
 * 功能：图标注册中心，唯一直接 import @phosphor-icons/react 的文件
 *       业务层和其他模块不得直接引用 Phosphor，统一通过此文件访问
 *       新增图标：在此文件和 icon-dictionary.ts 中同时添加
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Infrastructure
 * @category Registry
 */

import {
  // ==========================================================================
  // 通用交互 - 导航
  // ==========================================================================
  HouseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon as ArrowLongRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CaretDownIcon,

  // ==========================================================================
  // 通用交互 - 操作
  // ==========================================================================
  MagnifyingGlassIcon,
  GearIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XIcon,
  CheckIcon,
  TrashIcon as Trash2Icon,

  // ==========================================================================
  // 通用交互 - 状态
  // ==========================================================================
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  InfoIcon,

  // ==========================================================================
  // 云服务/智能体 - 平台
  // ==========================================================================
  RobotIcon,
  TimerIcon,
  DatabaseIcon,
  CloudIcon,
  EraserIcon,
  CubeIcon,
  BuildingIcon,

  // ==========================================================================
  // 云服务/智能体 - 数据
  // ==========================================================================
  ChartBarIcon,
  TableIcon,
  CodeIcon,
  PiIcon,
  ArrowRightIcon as ArrowRightCurveIcon,
  LightbulbIcon,
  SparkleIcon,
  ShieldCheckIcon,

  // ==========================================================================
  // 用户/组织
  // ==========================================================================
  UserIcon,
  UsersIcon,
  MedalIcon,
  StarIcon,

  // ==========================================================================
  // 通讯/联系
  // ==========================================================================
  EnvelopeIcon,
  PhoneIcon,
  WechatLogoIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  ChatCircleIcon,
  PaperPlaneTiltIcon,

  // ==========================================================================
  // 时间/日历
  // ==========================================================================
  CalendarIcon,
  ClockIcon,

  // ==========================================================================
  // 地图/位置
  // ==========================================================================
  MapPinIcon,

  // ==========================================================================
  // 主题/显示
  // ==========================================================================
  SunIcon,
  MoonIcon,
  GlobeIcon,

  // ==========================================================================
  // 其他
  // ==========================================================================
  CaretLeftIcon as CaretLeftBoldIcon,
  CaretRightIcon as CaretRightBoldIcon,

  // ==========================================================================
  // 系统保留（勿删）
  // ==========================================================================
  QuestionIcon,

} from '@phosphor-icons/react';

import type { IconName } from './icon-dictionary';

// ============================================================================
// 图标注册表
// ============================================================================

/**
 * Phosphor 图标组件映射
 *
 * 这是设计系统中唯一直接依赖 Phosphor Icons 的地方
 * 所有图标都通过这个映射表进行统一管理
 */
export const iconRegistry = {
  // ==========================================================================
  // 通用交互 - 导航
  // ==========================================================================
  home: HouseIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-long-right': ArrowLongRightIcon,
  'chevron-left': CaretLeftIcon,
  'chevron-right': CaretRightIcon,
  'chevron-up': CaretUpIcon,
  'chevron-down': CaretDownIcon,

  // ==========================================================================
  // 通用交互 - 操作
  // ==========================================================================
  search: MagnifyingGlassIcon,
  settings: GearIcon,
  edit: PencilIcon,
  delete: TrashIcon,
  add: PlusIcon,
  plus: PlusIcon,
  x: XIcon,
  check: CheckIcon,
  trash: Trash2Icon,
  cog: GearIcon,

  // ==========================================================================
  // 通用交互 - 状态
  // ==========================================================================
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: WarningCircleIcon,
  info: InfoIcon,

  // ==========================================================================
  // 云服务/智能体 - 平台
  // ==========================================================================
  agent: RobotIcon,
  workflow: TimerIcon,
  trigger: TimerIcon,
  database: DatabaseIcon,
  cloud: CloudIcon,
  server: EraserIcon,
  cube: CubeIcon,
  'building-library': BuildingIcon,

  // ==========================================================================
  // 云服务/智能体 - 数据
  // ==========================================================================
  chart: ChartBarIcon,
  'chart-bar': ChartBarIcon,
  table: TableIcon,
  code: CodeIcon,
  api: PiIcon,
  graph: ArrowRightCurveIcon,
  lightbulb: LightbulbIcon,
  sparkles: SparkleIcon,
  'shield-check': ShieldCheckIcon,

  // ==========================================================================
  // 用户/组织
  // ==========================================================================
  user: UserIcon,
  'user-group': UsersIcon,
  users: UsersIcon,
  medal: MedalIcon,
  star: StarIcon,

  // ==========================================================================
  // 通讯/联系
  // ==========================================================================
  mail: EnvelopeIcon,
  phone: PhoneIcon,
  wechat: WechatLogoIcon,
  github: GithubLogoIcon,
  linkedin: LinkedinLogoIcon,
  'chat-circle': ChatCircleIcon,
  'paperplane-tilt': PaperPlaneTiltIcon,

  // ==========================================================================
  // 时间/日历
  // ==========================================================================
  calendar: CalendarIcon,
  'calendar-days': CalendarIcon,
  clock: ClockIcon,

  // ==========================================================================
  // 地图/位置
  // ==========================================================================
  'map-pin': MapPinIcon,
  'map-marker': MapPinIcon,

  // ==========================================================================
  // 主题/显示
  // ==========================================================================
  sun: SunIcon,
  moon: MoonIcon,
  globe: GlobeIcon,

  // ==========================================================================
  // 其他
  // ==========================================================================
  'caret-left-bold': CaretLeftBoldIcon,
  'caret-right-bold': CaretRightBoldIcon,

  // ==========================================================================
  // 系统保留（勿删）
  // ==========================================================================
  placeholder: QuestionIcon,

} satisfies Record<IconName, React.ComponentType<any>>;
