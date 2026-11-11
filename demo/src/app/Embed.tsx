// 임베드 플레이어(embed.html#S5). 발표 슬라이드가 iframe 으로 부른다. npm run embed 가 단일 HTML(presentation/rmd-player.html)로 만든다.
// - 해시로 시나리오를 고른다. 바탕은 투명이다.
// - 무대(1920×1080)의 빈 여백을 잘라내고 확대한다. 시나리오마다 무대 요소가 차지하는 영역(embedCrop.ts, npm run embed:crop 이 잰다)이
//   iframe 에 꽉 차게 무대 전체를 옮기고 키운다. 무대 자체는 자르지 않으므로 영역 밖 그림자는 iframe 안에서 그대로 보인다.
// - 무대 아래에 한 바퀴 진행 막대를 둔다. 비트마다 칸을 나누고(폭은 비트 길이에 비례) 지난 칸은 채우고 지금 칸은 진행만큼 채운다.
//   kit 은 재생 시각을 내주지 않는다. 재생을 시작한 때부터 잰 시계를 쓰고, 비트가 끝날 때(onBeatEnd)마다 그 비트의 끝 시각으로 다시 맞춘다.
//   마지막 비트 뒤 처음으로 돌아가는 크로스페이드 동안 채움이 옅어지고, 처음으로 돌아가면 비워진다.
// - 부모와 postMessage 로 말한다(file:// 에서는 부모가 iframe 안을 직접 만질 수 없다).
//   준비되면 부모에 "rmd:ready" 를 보낸다. 처음에는 첫 화면에 멈춰 있다.
//   "rmd:play" 를 받으면 처음부터 loop 재생하고, "rmd:stop" 을 받으면 첫 화면으로 돌아가 멈춘다(막대도 비운다).
// - 부모 없이 바로 열면(개발) 곧바로 재생한다.
import { useEffect, useRef, useState } from "react";

import { lastBeatEnd, ScenarioStage } from "../kit";
import { findScenario } from "../scenarios";
import { type Crop, EMBED_CROP } from "./embedCrop";

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
const FULL: Crop = { x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT };
// 진행 막대 높이와 무대 사이 간격(iframe px).
const BAR_HEIGHT = 6;
const BAR_GAP = 10;

const embedded = window.parent !== window;

function scenarioFromHash() {
    return findScenario(decodeURIComponent(location.hash.slice(1)));
}

function viewport() {
    return { width: window.innerWidth, height: window.innerHeight };
}

export function EmbedScreen() {
    const [scenario, setScenario] = useState(scenarioFromHash);
    // run 은 재생 중에 다시 "rmd:play" 가 오면 커진다. 무대를 새로 만들어 처음부터 재생한다.
    const [state, setState] = useState({ playing: !embedded, run: 0 });
    const [size, setSize] = useState(viewport);
    const container = useRef<HTMLDivElement>(null);
    const bar = useRef<HTMLDivElement>(null);
    // 타임라인 시각 0 에 해당하는 performance.now()(ms). 재생 중이 아니면 null.
    const origin = useRef<number | null>(null);

    useEffect(() => {
        const onHash = () => setScenario(scenarioFromHash());
        const onResize = () => setSize(viewport());
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
        window.addEventListener("resize", onResize);
        window.addEventListener("message", onMessage);
        if (embedded) window.parent.postMessage("rmd:ready", "*");
        return () => {
            window.removeEventListener("hashchange", onHash);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("message", onMessage);
        };
    }, []);

    // 시계를 건다. kit 은 준비(data-rmd-ready)된 뒤 setTimeout(0) 으로 타임라인을 0 에 놓고 재생하므로 같은 차례 뒤에 건다.
    // 탭이 숨으면 kit 이 멈추므로 숨어 있던 만큼 시계를 민다.
    useEffect(() => {
        origin.current = null;
        const root = container.current;
        if (!state.playing || root == null) return;
        let timer: number | undefined;
        const start = () => {
            timer = window.setTimeout(() => {
                origin.current = performance.now();
            }, 0);
        };
        const ready = () => root.querySelector("[data-rmd-ready]") != null;
        const observer = new MutationObserver(() => {
            if (!ready()) return;
            observer.disconnect();
            start();
        });
        if (ready()) start();
        else {
            observer.observe(root, {
                attributes: true,
                subtree: true,
                attributeFilter: ["data-rmd-ready"],
            });
        }
        let hiddenAt: number | null = null;
        const onVisibility = () => {
            if (document.hidden) hiddenAt = performance.now();
            else if (hiddenAt != null && origin.current != null) {
                origin.current += performance.now() - hiddenAt;
                hiddenAt = null;
            }
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            observer.disconnect();
            window.clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisibility);
            origin.current = null;
        };
    }, [state.playing, state.run, scenario]);

    // 막대를 프레임마다 그린다(React 를 거치지 않는다).
    useEffect(() => {
        const element = bar.current;
        if (scenario == null || element == null) return;
        const fills = [
            ...element.querySelectorAll<HTMLElement>(".app-embed__fill"),
        ];
        const end = lastBeatEnd(scenario);
        let frame = 0;
        const draw = () => {
            const time =
                origin.current == null
                    ? null
                    : (Math.max(0, performance.now() - origin.current) / 1000) %
                      scenario.duration;
            const fade =
                time == null || time <= end
                    ? 1
                    : 1 - (time - end) / (scenario.duration - end);
            scenario.beats.forEach((beat, index) => {
                const fill = fills[index];
                if (fill == null) return;
                const ratio =
                    time == null
                        ? 0
                        : Math.max(
                              0,
                              Math.min(
                                  1,
                                  (time - beat.start) / (beat.end - beat.start),
                              ),
                          );
                fill.style.transform = `scaleX(${ratio})`;
                fill.style.opacity = String(fade);
            });
            element.dataset.appEmbedTime = time == null ? "" : time.toFixed(3);
            frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frame);
    }, [scenario]);

    if (scenario == null) return null;

    const crop = EMBED_CROP[scenario.id] ?? FULL;
    const room = Math.max(1, size.height - BAR_HEIGHT - BAR_GAP);
    const scale = Math.min(size.width / crop.width, room / crop.height);
    const left = (size.width - crop.width * scale) / 2;
    const top = (room - crop.height * scale) / 2;

    return (
        <div
            ref={container}
            className="app-embed"
            data-app-embed={scenario.id}
            data-app-embed-state={state.playing ? "playing" : "stopped"}
        >
            <div
                className="app-embed__stage"
                style={{
                    left: left - crop.x * scale,
                    top: top - crop.y * scale,
                    transform: `scale(${scale})`,
                }}
            >
                <ScenarioStage
                    key={state.run}
                    scenario={scenario}
                    mode="loop"
                    at={state.playing ? undefined : 0}
                    height={STAGE_HEIGHT}
                    background="transparent"
                    onBeatEnd={(index) => {
                        const beat = scenario.beats[index];
                        if (beat == null || origin.current == null) return;
                        origin.current = performance.now() - beat.end * 1000;
                    }}
                />
            </div>
            <div
                ref={bar}
                className="app-embed__bar"
                style={{
                    left,
                    top: top + crop.height * scale + BAR_GAP,
                    width: crop.width * scale,
                    height: BAR_HEIGHT,
                }}
            >
                {scenario.beats.map((beat) => (
                    <span
                        key={beat.id}
                        className="app-embed__segment"
                        style={{ flexGrow: beat.end - beat.start }}
                    >
                        <span className="app-embed__fill" />
                    </span>
                ))}
            </div>
        </div>
    );
}
