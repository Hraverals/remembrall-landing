// 발표 화면(?show · ?show=S2,S3,S5). 시나리오를 PPT 처럼 순서대로 넘기며 보인다. 시연 영상을 화면 녹화로 찍을 때 쓴다.
// 녹화 화면처럼 1920×1080 무대만 컨트롤 · 커서 없이 보인다(창에 맞춰 contain). 표지 · 제목 · 진행 표시는 두지 않는다.
// - 시나리오에 들어오면 비트를 처음부터 끝까지 이어 재생하고(step + onBeatEnd) 마지막 비트 끝 상태에서 멈춘다.
// - → · Space · 클릭: 다음 시나리오. ←: 이전 시나리오(처음부터). R: 지금 시나리오 다시 재생. 양 끝에서는 넘어가지 않는다.
// - 넘길 때 새 무대가 앞 무대 위로 0.4초 동안 나타난다(엔진의 끝 크로스페이드와 같은 길이). 앞 무대는 그동안만 밑에 남는다.
import { useEffect, useState } from "react";

import { type Scenario, ScenarioStage } from "../kit";

type Slot = { index: number; run: number };

export function ShowScreen({ scenarios }: { scenarios: readonly Scenario[] }) {
    // run 은 넘기거나 다시 재생할 때마다 커진다. 무대를 새로 만드는 key 다.
    const [slots, setSlots] = useState<{
        current: Slot;
        previous: Slot | null;
    }>({ current: { index: 0, run: 0 }, previous: null });

    const go = (delta: number) => {
        setSlots((value) => {
            const { current } = value;
            const index = current.index + delta;
            if (index < 0 || index >= scenarios.length) return value;
            return {
                current: { index, run: current.run + 1 },
                previous: current,
            };
        });
    };

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.key === "ArrowRight" || event.key === " ") go(1);
            else if (event.key === "ArrowLeft") go(-1);
            else if (event.key === "r" || event.key === "R") go(0);
            else return;
            event.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const { current, previous } = slots;
    return (
        <div
            className="app-show"
            data-app-show={scenarios[current.index]?.id ?? ""}
            onClick={() => go(1)}
        >
            {[previous, current].map((slot) => {
                const scenario = slot == null ? null : scenarios[slot.index];
                if (slot == null || scenario == null) return null;
                const entering = slot === current && current.run > 0;
                return (
                    <div
                        key={slot.run}
                        className={`app-show__layer${entering ? " app-show__layer--enter" : ""}`}
                        onAnimationEnd={(event) => {
                            if (event.target !== event.currentTarget) return;
                            setSlots((value) => ({ ...value, previous: null }));
                        }}
                    >
                        <Sequence scenario={scenario} />
                    </div>
                );
            })}
        </div>
    );
}

// 한 시나리오를 비트 0 부터 마지막 비트까지 이어 재생하고 멈춘다.
function Sequence({ scenario }: { scenario: Scenario }) {
    const [beat, setBeat] = useState(0);
    return (
        <ScenarioStage
            scenario={scenario}
            mode="step"
            beat={beat}
            onBeatEnd={(ended) =>
                setBeat((value) =>
                    ended === value && ended < scenario.beats.length - 1
                        ? ended + 1
                        : value,
                )
            }
        />
    );
}
