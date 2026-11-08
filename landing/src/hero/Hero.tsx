// 히어로. 왼쪽 카피 · 버튼, 오른쪽 폰(지금은 08 정지 화면). 좁은 화면에서는 카피 → 폰 순으로 쌓는다.
// 폰 뒤에는 바랜 사진 카드 세 장을 겹친다(앱 00a 일러스트의 회전값). 폰 폭 화면에서는 숨긴다.
// 폰 안 화면은 프레임으로 고른다. 배포 빌드는 POSTER_FRAME(08) 고정이고, 개발 서버에서만 장면 스위치가 뜬다.
import { lazy, Suspense, useState } from "react";

import { photo, type PhotoId } from "../assets/photos";
import { DemoScreen } from "../demo/DemoScreen";
import { type DemoFrameId, frameById, POSTER_FRAME } from "../demo/frames";
import { APK_URL } from "../links";
import { PhoneFrame } from "./PhoneFrame";

// 배포 빌드에서는 import.meta.env.DEV 가 false 로 바뀌어 동적 import 자체가 빠진다.
const DevSceneSwitch = import.meta.env.DEV
    ? lazy(() => import("../demo/DevSceneSwitch"))
    : null;

const MEMORIES: readonly { id: PhotoId; fade: "weeks" | "months" }[] = [
    { id: 488, fade: "months" },
    { id: 1031, fade: "months" },
    { id: 674, fade: "weeks" },
];

export function Hero() {
    const [frame, setFrame] = useState<DemoFrameId>(POSTER_FRAME);
    return (
        <section className="hero" aria-labelledby="hero-title">
            <div className="hero__copy">
                <p className="hero__eyebrow">Shorts에서 본 그곳</p>
                <h1 id="hero-title" className="hero__title">
                    저장만 하고 잊은 곳,
                    <br />
                    근처에서 다시 꺼내드려요.
                </h1>
                <p className="hero__lead">
                    Shorts를 REMEMBRALL로 공유하세요. 영상 속 장소를 찾으면 기억
                    탭에 넣어두고, 나중에 그 근처에 가면 알림으로 꺼내드려요.
                </p>
                <div className="hero__actions">
                    <a className="button button--primary" href={APK_URL}>
                        APK 다운로드
                    </a>
                    <span
                        className="button button--pending"
                        role="link"
                        aria-disabled="true"
                    >
                        Google Play 출시 예정
                    </span>
                </div>
                <p className="hero__note">
                    Android 전용 · 카카오테크캠퍼스 4기 충남 3팀
                </p>
            </div>

            <div className="hero__stage">
                <div className="hero__memories" aria-hidden="true">
                    {MEMORIES.map((memory) => (
                        <div
                            key={memory.id}
                            className={`memory memory--${memory.fade}`}
                        >
                            <img src={photo(memory.id, "sm")} alt="" />
                        </div>
                    ))}
                </div>
                <PhoneFrame
                    label="REMEMBRALL 장소 상세 화면. 3주 전에 저장한 성심당 본점이 도보 4분 거리에 있고, 바랬던 사진이 원래 색으로 돌아와 있어요."
                    caption={frameById(frame).caption}
                >
                    <DemoScreen frame={frame} />
                </PhoneFrame>
            </div>

            {DevSceneSwitch != null && (
                <Suspense fallback={null}>
                    <DevSceneSwitch frame={frame} onChange={setFrame} />
                </Suspense>
            )}
        </section>
    );
}
