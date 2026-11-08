// snapshot → 폰 화면(360×800). 층을 겹쳐 그린다(크로스페이드 중에는 둘). 맨 위에 손가락 · 클릭 링을 둔다.
// 손가락 · 링의 위치와 불투명도는 GSAP 타임라인이 맡는다. 처음에는 보이지 않는다.
import type { CSSProperties } from "react";

import { DEMO_LATER } from "./data";
import { ArchiveScene } from "./scenes/ArchiveScene";
import { DetailScene } from "./scenes/DetailScene";
import { MapScene } from "./scenes/MapScene";
import { NotificationShade } from "./scenes/NotificationShade";
import { ReceivedScene } from "./scenes/ReceivedScene";
import { ShortsScene } from "./scenes/ShortsScene";
import type { DemoSnapshot, SceneView } from "./story";

function Scene({ view }: { view: SceneView }) {
    switch (view.kind) {
        case "shorts":
            return <ShortsScene sheet={view.sheet} />;
        case "received":
            return (
                <ReceivedScene
                    status={view.status}
                    enter={view.enter}
                    text={view.text}
                />
            );
        case "archive":
            return (
                <ArchiveScene
                    layout={view.layout}
                    analyzing={view.analyzing}
                    fade={view.fade}
                />
            );
        case "map":
            return (
                <>
                    <MapScene
                        now={DEMO_LATER}
                        walk={view.walk}
                        notified={view.notified}
                        newSave
                    />
                    {view.pull > 0 && (
                        <NotificationShade now={DEMO_LATER} pull={view.pull} />
                    )}
                </>
            );
        case "detail":
            return <DetailScene fade={view.fade} />;
    }
}

// 같은 장면이 이어지면 같은 key 를 써서 다시 만들지 않는다. 크로스페이드 중인 두 층은 늘 종류가 달라 key 가 겹치지 않는다.
function layerKey(view: SceneView): string {
    return view.kind === "archive" ? `archive-${view.layout}` : view.kind;
}

export function DemoScreen({ snapshot }: { snapshot: DemoSnapshot }) {
    return (
        <>
            {snapshot.layers.map(({ view, opacity }) => (
                <div key={layerKey(view)} style={{ ...styles.layer, opacity }}>
                    <Scene view={view} />
                </div>
            ))}
            <span className="demo-finger" data-demo-pointer>
                <span className="demo-ring" data-demo-ring />
            </span>
        </>
    );
}

const styles = {
    layer: {
        position: "absolute",
        inset: 0,
    },
} satisfies Record<string, CSSProperties>;
