// 16:9 무대(폰 + 자막 + 시나리오별 옆 설명 층). 안쪽은 1920×1080 논리 px 이고 무대 폭에 맞춰 scale 한다.
// background "transparent" 면 무대 바탕을 그리지 않는다(슬라이드 배경 위에 얹기). 컨셉 시나리오는 오른쪽 위에 "컨셉" 표시.
// scenario · mode 가 바뀌면 key 로 새로 만든다.
import "../kit.css";

import { useRef } from "react";

import { usePlayback } from "../engine/usePlayback";
import { PhoneDevice } from "../phone/PhoneDevice";
import { Fit } from "../phone/Fit";
import { useScale } from "../phone/useScale";
import { playerLabel, type ScenarioPlayerProps } from "../props";

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export type ScenarioStageProps = ScenarioPlayerProps & {
    background?: "screen" | "transparent";
};

function Player({ background = "screen", ...props }: ScenarioStageProps) {
    const root = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const scale = useScale(stage, STAGE_WIDTH);
    const { snapshot, ready } = usePlayback(root, props);
    const { scenario } = props;
    const Aside = scenario.aside?.Component;
    const className = [
        "rmd-stage",
        background === "screen" && "rmd-stage--screen",
        Aside != null && "rmd-stage--aside",
    ]
        .filter(Boolean)
        .join(" ");
    return (
        <Fit
            ratio={STAGE_WIDTH / STAGE_HEIGHT}
            height={props.height}
            label={playerLabel(scenario.title, snapshot.captions)}
            ready={ready}
            rootRef={root}
        >
            <div ref={stage} className={className}>
                <div
                    className="rmd-stage__canvas"
                    style={{ transform: `scale(${scale})` }}
                >
                    <div className="rmd-stage__column">
                        <div className="rmd-stage__phone">
                            <PhoneDevice
                                scenario={scenario}
                                snapshot={snapshot}
                            />
                        </div>
                        <div className="rmd-stage__captions" aria-hidden="true">
                            {snapshot.captions.map((caption) => (
                                <p
                                    key={caption.text}
                                    className="rmd-stage__caption"
                                    style={{ opacity: caption.opacity }}
                                >
                                    {caption.text}
                                </p>
                            ))}
                        </div>
                    </div>
                    {Aside != null && (
                        <div className="rmd-stage__aside" aria-hidden="true">
                            <Aside view={snapshot.aside} beat={snapshot.beat} />
                        </div>
                    )}
                    {scenario.concept === true && (
                        <span className="rmd-stage__concept">컨셉</span>
                    )}
                </div>
            </div>
        </Fit>
    );
}

export function ScenarioStage(props: ScenarioStageProps) {
    return <Player key={`${props.scenario.id}:${props.mode}`} {...props} />;
}
