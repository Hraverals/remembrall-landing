// 폰만 그린다(발표 슬라이드에 직접 배치용). 자막은 그리지 않는다(비트의 caption 을 슬라이드가 쓸 수 있다).
// scenario · mode 가 바뀌면 key 로 새로 만든다(재생 훅은 한 시나리오 · 한 방식만 맡는다).
import "../kit.css";

import { useRef } from "react";

import { usePlayback } from "../engine/usePlayback";
import { playerLabel, type ScenarioPlayerProps } from "../props";
import { Fit } from "./Fit";
import { PHONE_RATIO, PhoneDevice } from "./PhoneDevice";

function Player(props: ScenarioPlayerProps) {
    const root = useRef<HTMLDivElement>(null);
    const { snapshot, ready } = usePlayback(root, props);
    return (
        <Fit
            ratio={PHONE_RATIO}
            height={props.height}
            label={playerLabel(props.scenario.title, snapshot.captions)}
            ready={ready}
            rootRef={root}
        >
            <PhoneDevice scenario={props.scenario} snapshot={snapshot} />
        </Fit>
    );
}

export function ScenarioPhone(props: ScenarioPlayerProps) {
    return <Player key={`${props.scenario.id}:${props.mode}`} {...props} />;
}
