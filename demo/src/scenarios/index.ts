// 시나리오 등록부. 발표 자료 · 갤러리는 여기서 꺼낸다. 항목은 { id, title, beats: { id, label, caption, start, end }[], concept? } 를 포함한다.
// 하나만 쓰면 개별 import(예: import { S2 } from "./s2")로 나머지를 번들에서 뺄 수 있다.
import type { Scenario } from "../kit/engine/types";
import { S1 } from "./s1";
import { S2 } from "./s2";
import { S3 } from "./s3";
import { S4 } from "./s4";
import { S5 } from "./s5";
import { S6 } from "./s6";

export const SCENARIOS: readonly Scenario[] = [S1, S2, S3, S4, S5, S6];

export function findScenario(id: string): Scenario | undefined {
    return SCENARIOS.find((scenario) => scenario.id === id);
}
