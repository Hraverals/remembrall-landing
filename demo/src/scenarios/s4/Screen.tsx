// S4 화면 상태(view)와 그리기. 기억 탭 하나를 세 시점(방금 · 3주 뒤 · 5개월 뒤)으로 본다.
// layout: 섹션 · 이름 계산 시점. age 0~2: 셀 바램이 시점 사이를 간 정도(0 = 방금, 1 = 3주 뒤, 2 = 5개월 뒤).
// 바램 값은 각 시점에서 앱 규칙(fadeFor → fade/* 0 · 0.3 · 0.5)이고, 사이에서만 이어 바뀐다.
// 날짜는 view 에 넣지 않는다(엔진이 view 의 숫자를 끊어 key 로 쓴다).
import { FADE_VALUE } from "../../kit/ui/fade";
import { fadeFor } from "../screens/album";
import { ArchiveScene } from "../screens/ArchiveScene";
import { DEMO_LATER, DEMO_MONTHS_LATER, DEMO_NOW } from "../screens/data";

const TIMES = [DEMO_NOW, DEMO_LATER, DEMO_MONTHS_LATER] as const;

export type Stage = 0 | 1 | 2;

export type View = { kind: "archive"; layout: Stage; age: number };

function fadeAt(savedAt: Date, age: number): number {
    const lower = Math.max(0, Math.min(TIMES.length - 2, Math.floor(age)));
    const from = FADE_VALUE[fadeFor(savedAt, TIMES[lower] ?? DEMO_NOW)];
    const to = FADE_VALUE[fadeFor(savedAt, TIMES[lower + 1] ?? DEMO_NOW)];
    return from + (to - from) * Math.max(0, Math.min(1, age - lower));
}

export function Screen({ view }: { view: View }) {
    return (
        <ArchiveScene
            now={TIMES[view.layout]}
            fade={(savedAt) => fadeAt(savedAt, view.age)}
        />
    );
}
