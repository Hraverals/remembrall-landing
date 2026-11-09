// GSAP 타임라인. usePlayback 이 화면에 보일 때만 동적 import 한다(별도 청크). gsap 은 이 파일에서만 import 한다.
// 타임라인 시각이 스토리 시계다. onTick 으로 시각을 넘기면 React 가 snapshotAt 으로 화면을 그린다.
// 손가락은 실제 DOM 의 data-rmd-target 위치로 움직이고 클릭 링을 띄운다. 실제 이벤트는 일으키지 않는다.
// 위치는 offsetLeft/Top 을 캔버스까지 더해 360×800 논리 px 로 잰다. 폰 배율 · 무대 배율 · 카메라 기울기와 상관없다.
// 카메라는 매 갱신마다 시각 함수(motion.camera)로 직접 적용한다. landing demo/timeline.ts 를 시나리오와 무관하게 나눈 것이다.
import { gsap } from "gsap";

import { easeInOutCubic } from "./clock";
import type { Scenario } from "./types";

class MissingScenarioMarkupError extends Error {
    readonly name = "MissingScenarioMarkupError";
}

type Point = { x: number; y: number };

// 첫 등장 전 손가락이 머무는 자리(화면 아래쪽 가운데 오른편).
const REST: Point = { x: 230, y: 560 };

export function createScenarioTimeline(
    root: HTMLElement,
    scenario: Scenario,
    options: { loop: boolean },
    onTick: (time: number) => void,
) {
    const canvas = root.querySelector<HTMLElement>("[data-rmd-canvas]");
    const pointer = root.querySelector<HTMLElement>("[data-rmd-pointer]");
    const ring = root.querySelector<HTMLElement>("[data-rmd-ring]");
    const camera = root.querySelector<HTMLElement>("[data-rmd-camera]");
    if (!canvas || !pointer || !ring || !camera) {
        throw new MissingScenarioMarkupError("시나리오 마크업이 모자라다");
    }
    const { motion } = scenario;

    // 대상이 아직 없으면(다른 장면) 손가락이 있던 자리를 그대로 쓴다.
    const point = (target: string): Point => {
        const element = canvas.querySelector<HTMLElement>(
            `[data-rmd-target="${target}"]`,
        );
        if (element == null) {
            return {
                x: Number(gsap.getProperty(pointer, "x")),
                y: Number(gsap.getProperty(pointer, "y")),
            };
        }
        let x = element.offsetWidth / 2;
        let y = element.offsetHeight / 2;
        let current: HTMLElement | null = element;
        while (current != null && current !== canvas) {
            x += current.offsetLeft;
            y += current.offsetTop;
            current = current.offsetParent as HTMLElement | null;
        }
        return { x, y };
    };

    const applyEffects = (time: number) => {
        const pose = motion.camera?.(time);
        camera.style.transform =
            pose == null
                ? ""
                : `translateY(${pose.y}px) rotate(${pose.rotate}deg) scale(${pose.scale})`;
    };

    // lazy: false — seek 로 여러 이동이 한 번에 처음 그려질 때 앞 이동의 값이 나중에 덮어쓰지 않게 한다.
    const timeline = gsap.timeline({
        paused: true,
        repeat: options.loop ? -1 : 0,
        repeatRefresh: options.loop,
        defaults: { lazy: false },
        onUpdate: () => {
            onTick(timeline.time());
            applyEffects(timeline.time());
        },
        onRepeat: () => {
            onTick(0);
            applyEffects(0);
        },
    });

    const context = gsap.context(() => {
        timeline.set(pointer, { ...REST, autoAlpha: 0, scale: 1 }, 0);
        timeline.set(ring, { autoAlpha: 0, scale: 1 }, 0);
        // 타임라인 길이를 duration 에 맞춘다(끝의 크로스페이드 동안에는 움직이는 것이 없다).
        timeline.set({}, {}, scenario.duration);

        for (const [show, hide] of motion.pointer) {
            timeline.to(pointer, { autoAlpha: 1, duration: 0.2 }, show);
            timeline.to(pointer, { autoAlpha: 0, duration: 0.2 }, hide);
        }

        // 누름: 손가락이 잠깐 작아지고 링이 퍼진다(보이기만 한다).
        const press = (at: number) => {
            timeline.to(
                pointer,
                { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 },
                at,
            );
            timeline.fromTo(
                ring,
                { scale: 1, autoAlpha: 0.7 },
                {
                    scale: 2.4,
                    autoAlpha: 0,
                    duration: 0.45,
                    ease: "power2.out",
                    immediateRender: false,
                },
                at,
            );
        };

        for (const tap of motion.taps) {
            timeline.to(
                pointer,
                {
                    x: () => point(tap.target).x,
                    y: () => point(tap.target).y,
                    duration: Math.max(0.2, tap.at - tap.move - 0.1),
                    ease: "power3.inOut",
                },
                tap.move,
            );
            press(tap.at);
        }

        // 끌기: 손가락이 나타나는 시각에 from 대상 자리로 옮겨 두고, 장면과 같은 easing 으로 끌어내린다.
        for (const drag of motion.drags ?? []) {
            const shown = motion.pointer.find(
                ([show, hide]) => show <= drag.at && drag.at <= hide,
            );
            timeline.set(
                pointer,
                {
                    x: () => point(drag.from).x,
                    y: () => point(drag.from).y,
                },
                shown?.[0] ?? drag.at - 0.5,
            );
            timeline.to(
                pointer,
                { scale: 0.85, duration: 0.15 },
                drag.at - 0.15,
            );
            timeline.to(
                pointer,
                { ...drag.to, duration: drag.duration, ease: easeInOutCubic },
                drag.at,
            );
            timeline.to(
                pointer,
                { scale: 1, duration: 0.15 },
                drag.at + drag.duration,
            );
        }
    });

    return {
        timeline,
        // 호출하는 쪽이 그 시각의 화면을 먼저 그린 뒤 부른다(대상 위치를 다시 잰다).
        seek(time: number) {
            timeline.pause().invalidate().time(time, false);
            applyEffects(time);
        },
        // 재생 중 비트 끝에 닿았을 때: 넘어간 만큼 되돌려 정확히 그 시각에 멈춘다.
        stop(time: number) {
            timeline.pause().time(time, true);
            applyEffects(time);
        },
        dispose() {
            timeline.kill();
            context.revert();
            camera.style.transform = "";
        },
    };
}

export type ScenarioTimeline = ReturnType<typeof createScenarioTimeline>;
