// 아이콘. 앱 C/Icon/* 과 같은 lucide 아이콘(선 1.75)이고, play 만 앱 전용 경로(채운 삼각형)다.
// 앱에 없는 것(Shorts 화면 · 공유 시트 · 알림창)도 일반 lucide 아이콘만 쓴다. 다른 앱 · 서비스의 로고는 그리지 않는다.
import {
    ArrowLeft,
    Bluetooth,
    ChevronRight,
    Copy,
    Ellipsis,
    Flashlight,
    Footprints,
    Heart,
    Images,
    LocateFixed,
    Mail,
    Map as MapGlyph,
    MessageCircle,
    MessageSquare,
    Moon,
    NotebookPen,
    Printer,
    Settings,
    Share2,
    Wifi,
} from "lucide-react";

const LUCIDE = {
    arrowLeft: ArrowLeft,
    chevronRight: ChevronRight,
    footprints: Footprints,
    map: MapGlyph,
    images: Images,
    settings: Settings,
    locateFixed: LocateFixed,
    heart: Heart,
    messageCircle: MessageCircle,
    share: Share2,
    copy: Copy,
    messageSquare: MessageSquare,
    notebookPen: NotebookPen,
    mail: Mail,
    bluetooth: Bluetooth,
    printer: Printer,
    ellipsis: Ellipsis,
    wifi: Wifi,
    flashlight: Flashlight,
    moon: Moon,
} as const;

export type IconName = keyof typeof LUCIDE | "play";

const STROKE_WIDTH = 1.75;

type Props = {
    name: IconName;
    size: number;
    color?: string;
};

export function Icon({ name, size, color = "var(--icon-default)" }: Props) {
    if (name === "play") {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24">
                <path d="M8 5.5V18.5L18.5 12L8 5.5Z" fill={color} />
            </svg>
        );
    }
    const Glyph = LUCIDE[name];
    return <Glyph size={size} color={color} strokeWidth={STROKE_WIDTH} />;
}
