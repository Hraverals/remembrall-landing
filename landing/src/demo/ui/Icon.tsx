// 앱 C/Icon/* 과 같은 lucide 아이콘(선 1.75). play 만 앱 전용 경로(채운 삼각형)다.
import { ArrowLeft, ChevronRight } from "lucide-react";

export type IconName = "arrowLeft" | "chevronRight" | "play";

const LUCIDE = {
    arrowLeft: ArrowLeft,
    chevronRight: ChevronRight,
} as const;

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
