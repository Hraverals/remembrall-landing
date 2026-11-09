// README 이식 가이드의 사용 예. 앱은 이 파일을 import 하지 않는다. typecheck · lint 가 이 예제들이 실제로 맞는지 확인한다.
// "// #region 이름" ~ "// #endregion" 구간은 README 의 <!-- example: 이름 --> 바로 다음 코드 블록과 글자 그대로 같아야 한다(npm run check:readme).
// README 에서는 import 경로를 발표 자료 쪽 예로 바꿔 보여 준다: "../../" → "./rmd/"(같은 글자 수라 prettier 줄바꿈도 같다).

// #region import
import { useState } from "react";

import { ScenarioPhone, ScenarioStage } from "../../kit";
import { findScenario, SCENARIOS } from "../../scenarios";
import { S3 } from "../../scenarios/s3";
import { S5 } from "../../scenarios/s5";
// #endregion

// #region phone-step
// 슬라이드 단계 번호(0부터)를 그대로 beat 로 넘긴다. 부모 상자에 높이가 있어야 한다(contain).
export function PhoneSlide({ step }: { step: number }) {
    return (
        <div style={{ height: 640 }}>
            <ScenarioPhone scenario={S5} mode="step" beat={step} />
        </div>
    );
}
// #endregion

// #region stage-step
// 슬라이드에 들어온 첫 단계(step 0)는 시작 전(beat -1)으로 두고, → 를 누를 때마다 비트 하나씩 재생한다.
// background="transparent" 면 무대 바탕 없이 슬라이드 배경 위에 얹힌다.
export function StageSlide({ step }: { step: number }) {
    return (
        <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
            <ScenarioStage
                scenario={S3}
                mode="step"
                beat={step - 1}
                background="transparent"
            />
        </div>
    );
}
// #endregion

// #region loop
// 전체를 반복 재생한다. height 를 주면 그 높이(폭은 16:9)로 그린다.
export function LoopBanner() {
    return <ScenarioStage scenario={S5} mode="loop" speed={1.5} height={360} />;
}
// #endregion

// #region auto-advance
// 비트가 끝까지 재생되면 onBeatEnd(비트 번호)가 온다. 다음 비트로 넘겨 자동 진행한다(마지막 비트에서 멈춘다).
export function AutoAdvance() {
    const [beat, setBeat] = useState(0);
    const last = S3.beats.length - 1;
    return (
        <div style={{ height: 480 }}>
            <ScenarioPhone
                scenario={S3}
                mode="step"
                beat={beat}
                onBeatEnd={(ended) => setBeat(Math.min(ended + 1, last))}
            />
        </div>
    );
}
// #endregion

// #region captions
// 등록부에서 시나리오를 꺼내 비트 자막을 슬라이드 글로 쓴다(ScenarioPhone 은 자막을 그리지 않는다).
export function CaptionList({ id }: { id: string }) {
    const scenario = findScenario(id) ?? SCENARIOS[0];
    if (scenario == null) return null;
    return (
        <ol>
            {scenario.beats.map((beat) => (
                <li key={beat.id}>{beat.caption}</li>
            ))}
        </ol>
    );
}
// #endregion

// #region still
// 특정 시각에 멈춘 화면(인쇄 · 썸네일용). at 은 mode 보다 앞선다.
export function Still() {
    const end = S5.beats[S5.beats.length - 1]?.end ?? 0;
    return <ScenarioPhone scenario={S5} mode="step" at={end} height={400} />;
}
// #endregion
