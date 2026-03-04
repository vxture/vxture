/**
 * iconMap.ts
 * @package @vxture/design-system
 *
 * 图标注册中心。
 * 唯一直接 import @phosphor-icons/react 的文件。
 * 业务层和其他模块不得直接引用 Phosphor，统一通过此文件访问。
 *
 * 新增图标：在对应分类下添加一行即可，IconName 类型自动更新。
 */

import {
  // 通用交互 - navigation
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

  // 通用交互 - action
  MagnifyingGlassIcon,
  GearIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XIcon,
  CheckIcon,
  TrashIcon as Trash2Icon,

  // 通用交互 - status
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  InfoIcon,

  // 云服务/智能体专属 - platform
  RobotIcon,
  TimerIcon,
  DatabaseIcon,
  CloudIcon,
  EraserIcon,
  CubeIcon,
  BuildingIcon,

  // 云服务/智能体专属 - data
  ChartBarIcon,
  TableIcon,
  CodeIcon,
  PiIcon,
  ArrowRightIcon as ArrowRightCurveIcon,
  LightbulbIcon,
  SparkleIcon,
  ShieldCheckIcon,

  // 用户/组织
  UserIcon,
  UsersIcon,
  MedalIcon,
  StarIcon,

  // 通讯/联系
  EnvelopeIcon,
  PhoneIcon,
  WechatLogoIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  ChatCircleIcon,
  PaperPlaneTiltIcon,

  // 时间/日历
  CalendarIcon,
  ClockIcon,

  // 地图/位置
  MapPinIcon,

  // 主题/显示
  SunIcon,
  MoonIcon,
  GlobeIcon,

  // 额外需要的图标
  CaretLeftIcon as CaretLeftBoldIcon,
  CaretRightIcon as CaretRightBoldIcon,

  // 系统保留
  QuestionIcon,

} from '@phosphor-icons/react';

/**
 * Phosphor 图标组件映射
 *
 * 这是设计系统中唯一直接依赖 Phosphor Icons 的地方
 * 所有图标都通过这个映射表进行统一管理
 */
export const iconMap = {
  // 通用交互 - navigation
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

  // 通用交互 - action
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

  // 通用交互 - status
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: WarningCircleIcon,
  info: InfoIcon,

  // 云服务/智能体专属 - platform
  agent: RobotIcon,
  workflow: TimerIcon,
  trigger: TimerIcon,
  database: DatabaseIcon,
  cloud: CloudIcon,
  server: EraserIcon,
  cube: CubeIcon,
  'building-library': BuildingIcon,

  // 云服务/智能体专属 - data
  chart: ChartBarIcon,
  'chart-bar': ChartBarIcon,
  table: TableIcon,
  code: CodeIcon,
  api: PiIcon,
  graph: ArrowRightCurveIcon,
  lightbulb: LightbulbIcon,
  sparkles: SparkleIcon,
  'shield-check': ShieldCheckIcon,

  // 用户/组织
  user: UserIcon,
  'user-group': UsersIcon,
  users: UsersIcon,
  medal: MedalIcon,
  star: StarIcon,

  // 通讯/联系
  mail: EnvelopeIcon,
  phone: PhoneIcon,
  wechat: WechatLogoIcon,
  github: GithubLogoIcon,
  linkedin: LinkedinLogoIcon,
  'chat-circle': ChatCircleIcon,

  // 时间/日历
  calendar: CalendarIcon,
  'calendar-days': CalendarIcon,
  clock: ClockIcon,

  // 地图/位置
  'map-pin': MapPinIcon,
  'map-marker': MapPinIcon,

  // 主题/显示
  sun: SunIcon,
  moon: MoonIcon,
  globe: GlobeIcon,

  // 额外需要的图标
  'paperplane-tilt': PaperPlaneTiltIcon,
  'caret-left-bold': CaretLeftBoldIcon,
  'caret-right-bold': CaretRightBoldIcon,

  // 系统保留勿删
  // name 无匹配时的最终兜底，永远保留
  'placeholder':   QuestionIcon,

} satisfies Record<string, React.ElementType>;
