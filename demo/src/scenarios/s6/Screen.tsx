// S6 화면 상태(view)와 그리기. 컨셉 화면(07e · 14 · 08d · 15)과 기존 장면(기억 탭 · 지도 · 알림창 · 08)을 잇는다.
// - archive: 07e 기억 탭(T0, 오후 네시 뺀 8개) + 추천 진입 줄
// - recommend: 14 추천. saved 면 광고 카드 저장 버튼이 저장된 상태
// - map: 2주 뒤 지도 + 알림창이 열린 채(오후 네시 "2주 전에 저장한 곳이 근처에 있어요", 앱 규칙 nearbyBody)
// - detail: 08d. 근처에서 연 08 이라 핀은 원래 색, 썸네일만 restore(bg/fade 불투명도)에서 0 으로 풀린다(앱 restoreFrom)
// - partner: 15 광고주 성과. fill 은 줄마다 막대가 차오른 정도
import { ArchiveScene } from "../screens/ArchiveScene";
import {
    afternoonFour,
    afternoonFourMap,
    DEMO_NOW,
    DEMO_TWO_WEEKS_LATER,
    s6AdSave,
    s6ArchiveSaves,
    s6MapSaves,
} from "../screens/data";
import { DetailScene } from "../screens/DetailScene";
import { MapScene } from "../screens/MapScene";
import { NotificationShade } from "../screens/NotificationShade";
import { PartnerScene } from "../screens/PartnerScene";
import { RecommendEntry } from "../screens/RecommendEntry";
import { RecommendScene } from "../screens/RecommendScene";

export type View =
    | { kind: "archive" }
    | { kind: "recommend"; saved: boolean }
    | { kind: "map" }
    | { kind: "detail"; restore: number }
    | { kind: "partner"; fill: readonly number[] };

export function Screen({ view }: { view: View }) {
    switch (view.kind) {
        case "archive":
            return (
                <ArchiveScene
                    now={DEMO_NOW}
                    saves={s6ArchiveSaves}
                    entry={<RecommendEntry />}
                />
            );
        case "recommend":
            return <RecommendScene saved={view.saved} />;
        case "map":
            return (
                <>
                    <MapScene
                        now={DEMO_TWO_WEEKS_LATER}
                        walk={0}
                        notified
                        newSave
                        saves={s6MapSaves}
                    />
                    <NotificationShade
                        now={DEMO_TWO_WEEKS_LATER}
                        pull={1}
                        saved={s6AdSave}
                    />
                </>
            );
        case "detail":
            return (
                <DetailScene
                    fade="recent"
                    thumbFade={view.restore}
                    detail={afternoonFour}
                    map={afternoonFourMap}
                />
            );
        case "partner":
            return <PartnerScene fill={view.fill} />;
    }
}
