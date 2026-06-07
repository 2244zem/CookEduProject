import { forwardRef, type ReactNode, type SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string
  strokeWidth?: number | string
}

function path(variant: string) {
  switch (variant) {
    case 'arrow-left':
      return <path d="M15 6.5 9.5 12 15 17.5M10 12h9" />
    case 'arrow-right':
      return <path d="M9 6.5 14.5 12 9 17.5M5 12h9" />
    case 'arrow-up-right':
      return <path d="M7 17 17 7M9 7h8v8" />
    case 'chevron-left':
      return <path d="M14.5 7 9.5 12l5 5" />
    case 'chevron-right':
      return <path d="m9.5 7 5 5-5 5" />
    case 'chevron-up':
      return <path d="m7 14.5 5-5 5 5" />
    case 'chevron-down':
      return <path d="m7 9.5 5 5 5-5" />
    case 'check':
      return <path d="m6.5 12.5 3.4 3.4 7.6-8" />
    case 'x':
      return <path d="m7.5 7.5 9 9M16.5 7.5l-9 9" />
    case 'plus':
      return <path d="M12 6.5v11M6.5 12h11" />
    case 'search':
      return <><circle cx="10.5" cy="10.5" r="5.8" /><path d="m15 15 4 4" /></>
    case 'send':
      return <><path d="M4.8 12.2 19 5.8l-3.4 13.4-3.5-5.1-5.6 2.8z" /><path d="m12.1 14.1 3.2-4" /></>
    case 'loader':
      return <><path d="M12 4a8 8 0 1 1-7.1 4.4" /><path d="M4.5 4.5v4h4" /></>
    case 'alert':
      return <><circle cx="12" cy="12" r="8.2" /><path d="M12 7.8v5.1M12 16.5h.1" /></>
    case 'warning':
      return <><path d="M12 4.6 21 19H3z" /><path d="M12 9v4.6M12 16.8h.1" /></>
    case 'info':
      return <><circle cx="12" cy="12" r="8.2" /><path d="M12 11v5M12 7.7h.1" /></>
    case 'user':
      return <><circle cx="12" cy="8.4" r="3.6" /><path d="M5.3 20a6.9 6.9 0 0 1 13.4 0" /></>
    case 'users':
      return <><circle cx="9.3" cy="8.8" r="3.1" /><circle cx="16" cy="9.5" r="2.4" /><path d="M3.8 20a5.8 5.8 0 0 1 11 0M14.5 19a4.8 4.8 0 0 1 5.7-3.7" /></>
    case 'home':
      return <><path d="M4.7 11.4 12 5l7.3 6.4" /><path d="M6.8 10.3V20h10.4v-9.7" /><path d="M10 20v-5h4v5" /></>
    case 'mail':
      return <><rect x="4" y="6.5" width="16" height="11" rx="3" /><path d="m5.5 8.3 6.5 5 6.5-5" /></>
    case 'phone':
      return <path d="M8.2 4.8 6.4 6.6c-.9.9-.6 3.5.9 6.1 1.7 2.9 4.2 5.4 7.1 6.9 2.3 1.2 4.4 1.2 5.2.4l1.6-1.7-4-3.4-2 1.5c-1.8-.8-3.8-2.8-4.7-4.7l1.5-2z" />
    case 'lock':
      return <><rect x="5.5" y="10" width="13" height="10" rx="3" /><path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10" /></>
    case 'eye':
      return <><path d="M3.8 12s3-5.8 8.2-5.8 8.2 5.8 8.2 5.8-3 5.8-8.2 5.8S3.8 12 3.8 12Z" /><circle cx="12" cy="12" r="2.7" /></>
    case 'eye-off':
      return <><path d="m4.5 4.5 15 15" /><path d="M8.4 8.2A8.7 8.7 0 0 0 3.8 12s3 5.8 8.2 5.8c1.3 0 2.5-.4 3.5-1" /><path d="M12.8 6.3c4.7.5 7.4 5.7 7.4 5.7a14 14 0 0 1-2.4 3.1" /></>
    case 'chef':
      return <><path d="M7.2 13.2c-2-.6-3.2-2.1-3.2-4 0-2.1 1.7-3.8 3.8-3.8.7 0 1.4.2 2 .6A4.2 4.2 0 0 1 17 6c.6-.3 1.2-.5 1.9-.5A3.6 3.6 0 0 1 22 9.1c0 2-1.3 3.5-3.2 4.1" /><path d="M7.4 12.7h9.2a2.2 2.2 0 0 1 2.2 2.2V20H5.2v-5.1a2.2 2.2 0 0 1 2.2-2.2Z" /><path d="M8 16.5h8" /></>
    case 'utensils':
      return <><path d="M7 4v16M4.7 4v5.4a2.3 2.3 0 1 0 4.6 0V4" /><path d="M16.5 4v16M16.5 4c2 1.3 3 3 3 5.5 0 2.2-1.1 3.9-3 4.8" /></>
    case 'heart':
      return <path d="M12 20s-7.6-4.4-8.5-10A4.4 4.4 0 0 1 11.4 7 4.4 4.4 0 0 1 20.5 10C19.6 15.6 12 20 12 20Z" />
    case 'bookmark':
      return <path d="M7 5.2A2.2 2.2 0 0 1 9.2 3h5.6A2.2 2.2 0 0 1 17 5.2V20l-5-3.2L7 20z" />
    case 'book':
      return <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v15H7.5A2.5 2.5 0 0 0 5 20.5z" /><path d="M5 5.5v15M8 7h8" /></>
    case 'bag':
      return <><path d="M6 9h12l-1 11H7z" /><path d="M9 9a3 3 0 0 1 6 0" /></>
    case 'cart':
      return <><path d="M4 5h2l2 10h8.5l2-7.5H7" /><circle cx="9.4" cy="19" r="1.3" /><circle cx="16.4" cy="19" r="1.3" /></>
    case 'coins':
      return <><ellipse cx="12" cy="6.5" rx="6.5" ry="3" /><path d="M5.5 6.5v5.5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3V6.5" /><path d="M5.5 11.8c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3M5.5 15.8c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3" /></>
    case 'wallet':
      return <><rect x="4" y="6.8" width="16" height="11.5" rx="3" /><path d="M16 11h4v3.3h-4a1.7 1.7 0 0 1 0-3.3Z" /><path d="M6.3 6.9 16 4.8" /></>
    case 'camera':
      return <><path d="M5 8.3h3l1.4-2h5.2l1.4 2h3A2.2 2.2 0 0 1 21.2 10v7A2.2 2.2 0 0 1 19 19.2H5A2.2 2.2 0 0 1 2.8 17v-7A2.2 2.2 0 0 1 5 8.3Z" /><circle cx="12" cy="13.5" r="3" /></>
    case 'image':
      return <><rect x="4" y="5" width="16" height="14" rx="3" /><path d="m6.5 16 3.4-3.3 2.5 2.4 2.3-2.8 3 3.7" /><circle cx="15.5" cy="9" r="1" /></>
    case 'video':
      return <><rect x="4" y="7" width="11" height="10" rx="2.5" /><path d="m15 10 5-2.5v9L15 14z" /></>
    case 'qr':
      return <><path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" /><path d="M14 14h2v2h-2zM18 14h1v5h-5v-1M14 18h2" /></>
    case 'spark':
      return <><path d="M12 3.5 14.1 9l5.4 2-5.4 2L12 18.5 9.9 13l-5.4-2 5.4-2z" /><path d="M18.5 4.8v3.4M16.8 6.5h3.4" /></>
    case 'bot':
      return <><rect x="5" y="8" width="14" height="10" rx="4" /><path d="M12 8V5" /><circle cx="9.5" cy="13" r="1" /><circle cx="14.5" cy="13" r="1" /><path d="M9.5 16h5" /></>
    case 'wand':
      return <><path d="m5 19 10-10" /><path d="m13 7 4 4" /><path d="M18 4v3M16.5 5.5h3M7 4v2M6 5h2" /></>
    case 'shield':
      return <><path d="M12 3.8 19 6v5.2c0 4.6-2.7 7.5-7 9-4.3-1.5-7-4.4-7-9V6z" /><path d="m8.6 12 2.2 2.2 4.7-5" /></>
    case 'gift':
      return <><path d="M4.5 10h15v10h-15zM3.5 7h17v3h-17zM12 7v13" /><path d="M12 7c-2.7 0-4.2-1-4.2-2.4 0-1 .8-1.6 1.8-1.6 1.8 0 2.4 2.2 2.4 4ZM12 7c2.7 0 4.2-1 4.2-2.4 0-1-.8-1.6-1.8-1.6C12.6 3 12 5.2 12 7Z" /></>
    case 'clock':
      return <><circle cx="12" cy="12" r="8.2" /><path d="M12 7.5v5l3.2 2" /></>
    case 'circle':
      return <><circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="3.3" /></>
    case 'grid':
      return <><rect x="4.5" y="4.5" width="6" height="6" rx="1.6" /><rect x="13.5" y="4.5" width="6" height="6" rx="1.6" /><rect x="4.5" y="13.5" width="6" height="6" rx="1.6" /><rect x="13.5" y="13.5" width="6" height="6" rx="1.6" /></>
    case 'chat':
      return <><path d="M5.2 6.3A7.9 7.9 0 0 1 12 3.8c4.7 0 8.5 3.2 8.5 7.2s-3.8 7.2-8.5 7.2c-.9 0-1.8-.1-2.6-.4L5 20l1.1-4.1A6.7 6.7 0 0 1 3.5 11c0-1.7.6-3.3 1.7-4.7Z" /><path d="M8.5 11h7M8.5 14h4.2" /></>
    case 'link':
      return <><path d="M9.5 14.5 14.5 9.5" /><path d="M10.5 7.5 12 6a4 4 0 0 1 5.7 5.7l-1.5 1.5" /><path d="M13.5 16.5 12 18a4 4 0 0 1-5.7-5.7l1.5-1.5" /></>
    case 'calendar':
      return <><rect x="4.5" y="5.8" width="15" height="14" rx="3" /><path d="M8 3.8v4M16 3.8v4M4.8 10h14.4" /></>
    case 'trophy':
      return <><path d="M8 4h8v4.5c0 3.2-1.6 5.2-4 6.2-2.4-1-4-3-4-6.2z" /><path d="M8 6H4.5c0 3 1.2 4.8 4 5.2M16 6h3.5c0 3-1.2 4.8-4 5.2M12 14.8V19M8.5 20h7" /></>
    case 'chart':
      return <><path d="M5 19V5M5 19h15" /><path d="M8 15.5v-4M12 15.5V8M16 15.5v-6" /></>
    case 'activity':
      return <path d="M4 13h3.3l2-5.5 4.1 10 2.2-4.5H20" />
    case 'file':
      return <><path d="M7 4h7l4 4v12H7z" /><path d="M14 4v5h5M9.5 13h5M9.5 16h4" /></>
    case 'filter':
      return <path d="M5 6h14l-5.2 6v5.5l-3.6 1.8V12z" />
    case 'menu':
      return <><path d="M5 7h14M5 12h14M5 17h14" /></>
    case 'trash':
      return <><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" /><path d="M10.5 11v5M13.5 11v5" /></>
    case 'upload':
      return <><path d="M12 16V5M8 9l4-4 4 4" /><path d="M5 16v3h14v-3" /></>
    case 'edit':
      return <><path d="M5 16.5V20h3.5L18.7 9.8l-3.5-3.5z" /><path d="m14.2 7.3 3.5 3.5" /></>
    case 'play':
      return <path d="M8 5.8v12.4L18 12z" />
    case 'pause':
      return <><path d="M8 6v12M16 6v12" /></>
    case 'terminal':
      return <><path d="m5 8 4 4-4 4M11 17h8" /></>
    case 'database':
      return <><ellipse cx="12" cy="6" rx="6.5" ry="2.8" /><path d="M5.5 6v6c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8V6" /><path d="M5.5 12v6c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-6" /></>
    case 'device':
      return <><rect x="7" y="3.5" width="10" height="17" rx="3" /><path d="M10.5 17.5h3" /></>
    default:
      return <><circle cx="12" cy="12" r="7.5" /><path d="M12 8v8M8 12h8" /></>
  }
}

function createIcon(name: string, variant: string) {
  return forwardRef<SVGSVGElement, IconProps>(function CookEduIcon(
    { className = '', size = 24, strokeWidth = 2, children, ...props },
    ref,
  ) {
    const content: ReactNode = children || path(variant)

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        data-cookedu-icon={name}
        className={`inline-block shrink-0 ${className}`.trim()}
        {...props}
      >
        <path d="M12 2.8c4.9 0 9.2 3.7 9.2 8.9 0 5.1-4.1 9.5-9.2 9.5s-9.2-4.4-9.2-9.5c0-5.2 4.3-8.9 9.2-8.9Z" fill="currentColor" opacity="0.08" stroke="none" />
        {content}
      </svg>
    )
  })
}

export const Activity = createIcon('Activity', 'activity')
export const AlertCircle = createIcon('AlertCircle', 'alert')
export const AlertTriangle = createIcon('AlertTriangle', 'warning')
export const ArrowLeft = createIcon('ArrowLeft', 'arrow-left')
export const ArrowRight = createIcon('ArrowRight', 'arrow-right')
export const ArrowUpRight = createIcon('ArrowUpRight', 'arrow-up-right')
export const Award = createIcon('Award', 'trophy')
export const BarChart = createIcon('BarChart', 'chart')
export const BarChart3 = createIcon('BarChart3', 'chart')
export const Bell = createIcon('Bell', 'alert')
export const BookOpen = createIcon('BookOpen', 'book')
export const Bookmark = createIcon('Bookmark', 'bookmark')
export const Bot = createIcon('Bot', 'bot')
export const Bug = createIcon('Bug', 'activity')
export const Calendar = createIcon('Calendar', 'calendar')
export const CalendarCheck = createIcon('CalendarCheck', 'calendar')
export const Camera = createIcon('Camera', 'camera')
export const Check = createIcon('Check', 'check')
export const CheckCircle = createIcon('CheckCircle', 'check')
export const CheckCircle2 = createIcon('CheckCircle2', 'check')
export const ChefHat = createIcon('ChefHat', 'chef')
export const ChevronDown = createIcon('ChevronDown', 'chevron-down')
export const ChevronLeft = createIcon('ChevronLeft', 'chevron-left')
export const ChevronRight = createIcon('ChevronRight', 'chevron-right')
export const ChevronUp = createIcon('ChevronUp', 'chevron-up')
export const Circle = createIcon('Circle', 'circle')
export const Clock = createIcon('Clock', 'clock')
export const Coins = createIcon('Coins', 'coins')
export const Cpu = createIcon('Cpu', 'device')
export const Crown = createIcon('Crown', 'trophy')
export const Database = createIcon('Database', 'database')
export const Edit3 = createIcon('Edit3', 'edit')
export const ExternalLink = createIcon('ExternalLink', 'arrow-up-right')
export const Eye = createIcon('Eye', 'eye')
export const EyeOff = createIcon('EyeOff', 'eye-off')
export const FileText = createIcon('FileText', 'file')
export const FileWarning = createIcon('FileWarning', 'warning')
export const Filter = createIcon('Filter', 'filter')
export const Flame = createIcon('Flame', 'spark')
export const Gift = createIcon('Gift', 'gift')
export const Globe = createIcon('Globe', 'circle')
export const GraduationCap = createIcon('GraduationCap', 'book')
export const Grid = createIcon('Grid', 'grid')
export const HardDrive = createIcon('HardDrive', 'database')
export const Hash = createIcon('Hash', 'grid')
export const Heart = createIcon('Heart', 'heart')
export const HeartPulse = createIcon('HeartPulse', 'activity')
export const History = createIcon('History', 'clock')
export const Home = createIcon('Home', 'home')
export const Image = createIcon('Image', 'image')
export const Info = createIcon('Info', 'info')
export const Layers = createIcon('Layers', 'grid')
export const LayoutDashboard = createIcon('LayoutDashboard', 'grid')
export const LayoutGrid = createIcon('LayoutGrid', 'grid')
export const List = createIcon('List', 'menu')
export const Loader2 = createIcon('Loader2', 'loader')
export const Lock = createIcon('Lock', 'lock')
export const LockKeyhole = createIcon('LockKeyhole', 'lock')
export const LogOut = createIcon('LogOut', 'arrow-right')
export const Mail = createIcon('Mail', 'mail')
export const Medal = createIcon('Medal', 'trophy')
export const Menu = createIcon('Menu', 'menu')
export const MessageCircle = createIcon('MessageCircle', 'chat')
export const Monitor = createIcon('Monitor', 'device')
export const Paperclip = createIcon('Paperclip', 'link')
export const Pause = createIcon('Pause', 'pause')
export const Pencil = createIcon('Pencil', 'edit')
export const Phone = createIcon('Phone', 'phone')
export const Play = createIcon('Play', 'play')
export const PlayCircle = createIcon('PlayCircle', 'play')
export const Plus = createIcon('Plus', 'plus')
export const PlusCircle = createIcon('PlusCircle', 'plus')
export const QrCode = createIcon('QrCode', 'qr')
export const RefreshCw = createIcon('RefreshCw', 'loader')
export const Refrigerator = createIcon('Refrigerator', 'device')
export const RotateCcw = createIcon('RotateCcw', 'loader')
export const Save = createIcon('Save', 'upload')
export const Search = createIcon('Search', 'search')
export const Send = createIcon('Send', 'send')
export const Settings = createIcon('Settings', 'device')
export const Share2 = createIcon('Share2', 'arrow-up-right')
export const Shield = createIcon('Shield', 'shield')
export const ShieldCheck = createIcon('ShieldCheck', 'shield')
export const ShoppingBag = createIcon('ShoppingBag', 'bag')
export const ShoppingCart = createIcon('ShoppingCart', 'cart')
export const Smartphone = createIcon('Smartphone', 'device')
export const Snowflake = createIcon('Snowflake', 'spark')
export const Sparkles = createIcon('Sparkles', 'spark')
export const Star = createIcon('Star', 'spark')
export const Target = createIcon('Target', 'circle')
export const Terminal = createIcon('Terminal', 'terminal')
export const Timer = createIcon('Timer', 'clock')
export const Trash2 = createIcon('Trash2', 'trash')
export const TrendingUp = createIcon('TrendingUp', 'chart')
export const TriangleAlert = createIcon('TriangleAlert', 'warning')
export const Trophy = createIcon('Trophy', 'trophy')
export const Upload = createIcon('Upload', 'upload')
export const User = createIcon('User', 'user')
export const Users = createIcon('Users', 'users')
export const Utensils = createIcon('Utensils', 'utensils')
export const UtensilsCrossed = createIcon('UtensilsCrossed', 'utensils')
export const Video = createIcon('Video', 'video')
export const Volume2 = createIcon('Volume2', 'activity')
export const WalletCards = createIcon('WalletCards', 'wallet')
export const Wand2 = createIcon('Wand2', 'wand')
export const X = createIcon('X', 'x')
export const XCircle = createIcon('XCircle', 'x')
export const Zap = createIcon('Zap', 'spark')
