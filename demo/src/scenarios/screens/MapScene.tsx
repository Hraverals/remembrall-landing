// 5 · 6 지도 탭(앱 10). 지도가 화면 전체를 덮고 헤더는 없다. 오른쪽 아래 내 위치 버튼, 하단 바(지도 선택).
// 핀은 저장물 장소(장소마다 하나)이고 바램 · 크기는 now 기준 저장 시점으로 정한다. 선택한 핀이 없어 이름표는 없다.
// 앱처럼 지금 위치를 먼저 넣어 핀이 그 위에 그려진다. 핀은 오래된 것부터 넣어 선명한 핀이 위에 온다.
// walk: 0 은 출발(대흥동 목 지금 위치), 1 은 성심당 근처 도착. notified 면 상태 표시줄에 알림 아이콘이 있다.
// newSave: 방금 공유한 저장물(성심당) 핀을 그릴지. 받음 시트 뒤(T0)에는 아직 장소를 몰라 그리지 않는다. 앱 10 처럼 경로 점선은 없다.
import type { CSSProperties } from "react";

import { type DemoSave, fadeFor } from "./album";
import { coordinates, saves as demoSaves, WALK_END, walkStart } from "./data";
import { lerp, project } from "../../kit/ui/geo";
import { BOTTOM_NAV_HEIGHT, BottomNav } from "../../kit/ui/BottomNav";
import { DemoMap } from "../../kit/ui/DemoMap";
import { Icon } from "../../kit/ui/Icon";
import { CurrentLocation, PhotoPin } from "../../kit/ui/MapMarkers";
import { NavigationBar, StatusBar } from "../../kit/ui/StatusBar";
import type { Fade } from "../../kit/ui/fade";

const LAYER: Record<Fade, number> = { months: 0, weeks: 1, recent: 2 };

type Props = {
    now: Date;
    walk: number;
    notified: boolean;
    newSave: boolean;
    // 지도에 그릴 저장물(최신 저장순, 첫 항목이 newSave 대상). 없으면 데모 저장물 9개.
    saves?: readonly DemoSave[];
};

export function MapScene({
    now,
    walk,
    notified,
    newSave,
    saves = demoSaves,
}: Props) {
    const pins = saves
        .filter((_save, index) => newSave || index !== 0)
        .map((save) => ({
            save,
            fade: fadeFor(save.savedAt, now),
            point: project(coordinates[save.id] ?? walkStart),
        }))
        .sort((a, b) => LAYER[a.fade] - LAYER[b.fade]);
    const start = project(walkStart);
    const goal = lerp(
        start,
        project(coordinates.sungsimdang ?? walkStart),
        WALK_END,
    );
    const here = lerp(start, goal, walk);

    return (
        <div style={styles.screen}>
            <DemoMap />
            <CurrentLocation {...here} />
            {pins.map(({ save, fade, point }) => (
                <PhotoPin
                    key={save.id}
                    {...point}
                    photo={save.photo}
                    fade={fade}
                />
            ))}

            <StatusBar notification={notified} />

            <div style={styles.locate}>
                <Icon name="locateFixed" size={22} />
            </div>

            <BottomNav active="map" />
            <NavigationBar />
        </div>
    );
}

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "var(--bg-screen)",
    },
    // 내 위치 버튼 44(안쪽 11 + 아이콘 22): 오른쪽 16, 하단 바 위 20.
    locate: {
        position: "absolute",
        right: 16,
        bottom: BOTTOM_NAV_HEIGHT + 20,
        display: "flex",
        padding: 11,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-surface)",
        boxShadow: "var(--elevation-low)",
    },
} satisfies Record<string, CSSProperties>;
