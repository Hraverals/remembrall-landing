// 바랜 기억. 같은 사진(데모의 성심당 1080)이 방금 · 3주 전 · 5개월 전에 바래는 단계와, 근처에서 다시 연 순간.
// 바램은 데모 Thumb 그대로 bg/fade 덮개다(0 · 30% · 50%). 앱의 "근처에서 연 기억은 원래 색으로 그리기"와 같은 동작이다.
// 섹션이 40% 보이면 네 번째 사진이 50% 에서 원래 색으로 한 번 풀린다(CSS 전환, sections.css). 동작 줄이기면 처음부터 원래 색이다.
import { useRef } from "react";

import type { PhotoId } from "../assets/photos";
import { Thumb } from "../demo/ui/Thumb";
import { useInView } from "./useInView";

const PHOTO: PhotoId = 1080;
const PHOTO_RADIUS = 16;

export function FadedMemory() {
    const strip = useRef<HTMLOListElement>(null);
    const seen = useInView(strip, 0.4);
    const stages = [
        { label: "방금", fade: "recent" as const },
        { label: "3주 전", fade: "weeks" as const },
        { label: "5개월 전", fade: "months" as const },
        { label: "근처에서", fade: seen ? 0 : 0.5, restores: true },
    ];
    return (
        <section className="section faded" aria-labelledby="faded-title">
            <div className="faded__text">
                <h2 id="faded-title" className="section__title">
                    오래 잊은 것일수록 바래 있어요
                </h2>
                <p className="section__lead">
                    저장한 지 오래된 곳일수록 사진이 바래 보여요. 그 근처에서
                    다시 열면, 사진이 원래 색으로 돌아와요.
                </p>
            </div>
            <ol
                ref={strip}
                className="faded__strip"
                aria-label="같은 사진이 저장한 뒤 시간에 따라 바래고, 근처에서 다시 열면 원래 색으로 돌아오는 네 단계"
            >
                {stages.map((stage) => (
                    <li
                        key={stage.label}
                        className={
                            "restores" in stage
                                ? "faded__stage faded__stage--restores"
                                : "faded__stage"
                        }
                    >
                        <Thumb
                            id={PHOTO}
                            fade={stage.fade}
                            radius={PHOTO_RADIUS}
                        />
                        <span className="faded__caption">{stage.label}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
