// 히어로. 왼쪽 카피 · 버튼, 오른쪽 폰(지금은 08 정지 화면). 좁은 화면에서는 카피 → 폰 순으로 쌓는다.
// 폰 뒤에는 바랜 사진 카드 세 장을 겹친다(앱 00a 일러스트의 회전값). 폰 폭 화면에서는 숨긴다.
// 폰 안 화면은 스토리 시계(useDemoPlayback)가 정한다. 처음부터 t=0(Shorts)이고, 동작 줄이기 · 불러오기 실패면 08 정지 화면이다.
// 오른쪽 아래 카드(data-demo-memory)는 08 사진이 풀릴 때 같이 원래 색으로 돌아온다. 개발 서버에서만 시간 패널이 뜬다.
import { lazy, Suspense, useRef } from "react";

import { photo, type PhotoId } from "../assets/photos";
import { DemoControls } from "../demo/DemoControls";
import { DemoScreen } from "../demo/DemoScreen";
import { useDemoPlayback } from "../demo/useDemoPlayback";
import { APK_URL } from "../links";
import { PhoneFrame } from "./PhoneFrame";

// 배포 빌드에서는 import.meta.env.DEV 가 false 로 바뀌어 동적 import 자체가 빠진다.
const DevTimeline = import.meta.env.DEV
    ? lazy(() => import("../demo/DevTimeline"))
    : null;

const DEMO_LABEL =
    "REMEMBRALL 사용 흐름 시연. Shorts를 공유해 저장하고, 3주 뒤 그 근처에서 알림을 눌러 성심당 본점 상세를 열어요.";
const STILL_LABEL =
    "REMEMBRALL 장소 상세 화면. 3주 전에 저장한 성심당 본점이 도보 4분 거리에 있고, 바랬던 사진이 원래 색으로 돌아와 있어요.";

const MEMORIES: readonly {
    id: PhotoId;
    fade: "weeks" | "months";
    restores?: boolean;
}[] = [
    { id: 488, fade: "months" },
    { id: 1031, fade: "months" },
    { id: 674, fade: "weeks", restores: true },
];

export function Hero() {
    const stage = useRef<HTMLDivElement>(null);
    const playback = useDemoPlayback(stage);
    const still = playback.reduced || playback.failed;
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
                    Android 전용 · 카카오테크캠퍼스 4기 충남대 3팀
                </p>
            </div>

            <div ref={stage} className="hero__stage">
                <div className="hero__memories" aria-hidden="true">
                    {MEMORIES.map((memory) => (
                        <div
                            key={memory.id}
                            className={`memory memory--${memory.fade}`}
                            data-demo-memory={memory.restores ? "" : undefined}
                        >
                            <img src={photo(memory.id, "sm")} alt="" />
                        </div>
                    ))}
                </div>
                <PhoneFrame
                    label={still ? STILL_LABEL : DEMO_LABEL}
                    captions={playback.snapshot.captions}
                    controls={<DemoControls playback={playback} />}
                >
                    <DemoScreen snapshot={playback.snapshot} />
                </PhoneFrame>
            </div>

            {DevTimeline != null && (
                <Suspense fallback={null}>
                    <DevTimeline playback={playback} />
                </Suspense>
            )}
        </section>
    );
}
