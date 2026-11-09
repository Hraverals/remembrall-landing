// S5 화면 상태(view)와 그리기. 시점은 3주 뒤(DEMO_LATER)다.
// map: 지도 탭(성심당 핀 포함). walk 0~1 걷기, notified 상태 표시줄 알림 아이콘, pull 알림창을 끌어내린 정도.
// detail: 08. 근처에서 연 경로라 핀은 원래 색이고, 썸네일만 restore(bg/fade 불투명도)에서 0 으로 풀린다(앱 restoreFrom).
import { DetailScene } from "../screens/DetailScene";
import { DEMO_LATER } from "../screens/data";
import { MapScene } from "../screens/MapScene";
import { NotificationShade } from "../screens/NotificationShade";

export type View =
    | { kind: "map"; walk: number; notified: boolean; pull: number }
    | { kind: "detail"; restore: number };

export function Screen({ view }: { view: View }) {
    switch (view.kind) {
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
            return <DetailScene fade="recent" thumbFade={view.restore} />;
    }
}
