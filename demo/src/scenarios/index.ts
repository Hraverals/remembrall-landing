// 시나리오 등록부. 발표 자료 · 갤러리는 여기서 꺼낸다. 항목은 { id, title, beats: { id, label, caption, start, end }[], concept? } 를 포함한다.
// 하나만 쓰면 개별 import(예: import { S2 } from "./s2")로 나머지를 번들에서 뺄 수 있다.
import type { Scenario } from "../kit/engine/types";
import { S2 } from "./s2";

export const SCENARIOS: readonly Scenario[] = [S2];

export function findScenario(id: string): Scenario | undefined {
    return SCENARIOS.find((scenario) => scenario.id === id);
}
