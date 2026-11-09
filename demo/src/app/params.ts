// 주소 매개변수. 갤러리 밖 화면(개발용 정지)을 고른다.
//   ?s=S2               갤러리에서 S2 를 연다
//   ?s=S2&t=3.2         S2 의 3.2초에 멈춘 1920×1080 무대(스크린샷용)
//   ?s=S2&beat=2        S2 의 비트 2(0부터) 끝 상태에 멈춘 무대(스크린샷용)
//   &view=phone         무대 대신 폰만(높이 1080)
//   &bg=transparent     무대 바탕 없이
//   ?record=S5          녹화 모드: 1920×1080 무대만 컨트롤 · 커서 없이 loop 재생(창에 맞춰 contain)
//     &speed=1.5        재생 속도(0.25 ~ 4, 기본 1)
//     &bg=transparent   무대 바탕 없이 페이지를 크로마키 초록(#00FF00)으로 칠한다(화면 녹화는 투명을 담지 못한다)
import { findScenario } from "../scenarios";
import type { Scenario } from "../kit";

export type Frozen = {
    scenario: Scenario;
    at: number;
    view: "stage" | "phone";
    background: "screen" | "transparent";
};

export type Recording = {
    scenario: Scenario;
    speed: number;
    background: "screen" | "transparent";
};

function number(value: string | null): number | null {
    if (value == null || value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

export function readParams(search: string) {
    const params = new URLSearchParams(search);
    const scenario = findScenario(params.get("s") ?? "");
    const time = number(params.get("t"));
    const beat = number(params.get("beat"));
    let frozen: Frozen | null = null;
    if (scenario != null && (time != null || beat != null)) {
        const at =
            time ??
            scenario.beats[
                Math.max(0, Math.min(scenario.beats.length - 1, beat ?? 0))
            ]?.end ??
            0;
        frozen = {
            scenario,
            at,
            view: params.get("view") === "phone" ? "phone" : "stage",
            background:
                params.get("bg") === "transparent" ? "transparent" : "screen",
        };
    }
    const recordTarget = findScenario(params.get("record") ?? "");
    const recording: Recording | null =
        recordTarget == null
            ? null
            : {
                  scenario: recordTarget,
                  speed: Math.max(
                      0.25,
                      Math.min(4, number(params.get("speed")) ?? 1),
                  ),
                  background:
                      params.get("bg") === "transparent"
                          ? "transparent"
                          : "screen",
              };
    return { scenarioId: scenario?.id ?? null, frozen, recording };
}
