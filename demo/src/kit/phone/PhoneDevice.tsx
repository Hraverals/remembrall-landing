// 폰 몸체 + 360×800 캔버스 + 장면 층 + 손가락. ScenarioPhone · ScenarioStage 가 같이 쓴다.
// 층을 겹쳐 그린다(크로스페이드 중에는 둘). 같은 구간이 이어지면 같은 key 라 다시 만들지 않는다.
// 몸체(data-rmd-camera)는 카메라가 살짝 확대 · 기울인다. 캔버스는 보여주기용이라 inert · aria-hidden 이다.
import { useRef } from "react";

import type { Snapshot } from "../engine/clock";
import type { Scenario } from "../engine/types";
import { useScale } from "./useScale";

export const SCREEN_WIDTH = 360;
export const SCREEN_HEIGHT = 800;
// 몸체 비율(384×824 = 화면 + 테두리 12).
export const PHONE_RATIO = 384 / 824;

type Props = {
    scenario: Scenario;
    snapshot: Snapshot;
};

export function PhoneDevice({ scenario, snapshot }: Props) {
    const screen = useRef<HTMLDivElement>(null);
    const scale = useScale(screen, SCREEN_WIDTH);
    const { Screen } = scenario;
    return (
        <div className="rmd-phone">
            <div className="rmd-phone__body" data-rmd-camera>
                <div ref={screen} className="rmd-phone__screen">
                    <div
                        className="rmd-phone__canvas"
                        data-rmd-canvas
                        style={{
                            width: SCREEN_WIDTH,
                            height: SCREEN_HEIGHT,
                            transform: `scale(${scale})`,
                        }}
                        aria-hidden="true"
                        inert
                    >
                        {snapshot.layers.map((layer) => (
                            <div
                                key={layer.key}
                                className="rmd-phone__layer"
                                style={{ opacity: layer.opacity }}
                            >
                                <Screen view={layer.view} />
                            </div>
                        ))}
                        <span className="rmd-finger" data-rmd-pointer>
                            <span className="rmd-ring" data-rmd-ring />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
