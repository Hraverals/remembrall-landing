// ScenarioPhone · ScenarioStage 가 같이 받는 props.
import type { PlaybackOptions } from "./engine/usePlayback";

export type ScenarioPlayerProps = PlaybackOptions & {
    // 그려질 높이(px). 폭은 비율로 정한다. 없으면 부모 상자의 가로 · 세로 안에 맞춘다(contain).
    height?: number;
};

// 접근성 이름: 시나리오 제목 + 지금 자막.
export function playerLabel(
    title: string,
    captions: readonly { text: string; opacity: number }[],
): string {
    const caption = [...captions].sort((a, b) => b.opacity - a.opacity)[0];
    return caption == null ? title : `${title}. ${caption.text}`;
}
