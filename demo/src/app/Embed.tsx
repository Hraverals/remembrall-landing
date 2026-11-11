// 임베드 플레이어(embed.html#S5). 발표 슬라이드가 iframe 으로 부른다. npm run embed 가 단일 HTML(presentation/rmd-player.html)로 만든다.
// - 해시로 시나리오를 고른다. 바탕은 투명이고 무대는 iframe 안에 16:9 contain 으로 그린다.
// - 부모와 postMessage 로 말한다(file:// 에서는 부모가 iframe 안을 직접 만질 수 없다).
//   준비되면 부모에 "rmd:ready" 를 보낸다. 처음에는 첫 화면에 멈춰 있다.
//   "rmd:play" 를 받으면 처음부터 loop 재생하고, "rmd:stop" 을 받으면 첫 화면으로 돌아가 멈춘다.
// - 부모 없이 바로 열면(개발) 곧바로 재생한다.
import { useEffect, useState } from "react";

import { ScenarioStage } from "../kit";
import { findScenario } from "../scenarios";

const embedded = window.parent !== window;

function scenarioFromHash() {
    return findScenario(decodeURIComponent(location.hash.slice(1)));
}

export function EmbedScreen() {
    const [scenario, setScenario] = useState(scenarioFromHash);
    // run 은 재생 중에 다시 "rmd:play" 가 오면 커진다. 무대를 새로 만들어 처음부터 재생한다.
    const [state, setState] = useState({ playing: !embedded, run: 0 });

    useEffect(() => {
        const onHash = () => setScenario(scenarioFromHash());
        const onMessage = (event: MessageEvent) => {
            if (event.data === "rmd:play") {
                setState(({ playing, run }) => ({
                    playing: true,
                    run: playing ? run + 1 : run,
                }));
            } else if (event.data === "rmd:stop") {
                setState(({ run }) => ({ playing: false, run }));
            }
        };
        window.addEventListener("hashchange", onHash);
        window.addEventListener("message", onMessage);
        if (embedded) window.parent.postMessage("rmd:ready", "*");
        return () => {
            window.removeEventListener("hashchange", onHash);
            window.removeEventListener("message", onMessage);
        };
    }, []);

    if (scenario == null) return null;
    return (
        <div
            className="app-embed"
            data-app-embed={scenario.id}
            data-app-embed-state={state.playing ? "playing" : "stopped"}
        >
            <ScenarioStage
                key={state.run}
                scenario={scenario}
                mode="loop"
                at={state.playing ? undefined : 0}
                background="transparent"
            />
        </div>
    );
}
