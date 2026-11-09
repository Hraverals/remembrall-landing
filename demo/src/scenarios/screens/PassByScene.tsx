// S1 일반 지도(Remembrall 이 없을 때). 지도 바탕(DemoMap)과 사람 점만 쓰고, Remembrall 지도 탭 요소(하단 바 · 사진 핀 · 내 위치 버튼)는 없다.
// 저장했던 곳은 이름 없는 흐린 점선 원(text/disabled)으로만 보인다: 보는 사람은 "저기였다"를 알지만 화면 속 사용자에게는 아무 일도 없다.
// walk: 0 ~ 1 걷기(성심당 바로 앞을 지나쳐 계속 간다). mark: 점선 원의 불투명도(사람 점이 다가올 때만 옅게 보인다).
import type { CSSProperties } from "react";

import { DemoMap } from "../../kit/ui/DemoMap";
import { lerp } from "../../kit/ui/geo";
import { CurrentLocation } from "../../kit/ui/MapMarkers";
import { NavigationBar, StatusBar } from "../../kit/ui/StatusBar";
import { s1Walk } from "./data";

const RING = 18;

export function PassByScene({ walk, mark }: { walk: number; mark: number }) {
    const here = lerp(s1Walk.from, s1Walk.to, walk);
    const { place } = s1Walk;
    return (
        <div style={styles.screen}>
            <DemoMap />
            <svg
                width="360"
                height="800"
                style={{ ...styles.mark, opacity: mark }}
            >
                <circle
                    cx={place.x}
                    cy={place.y}
                    r={RING}
                    fill="none"
                    stroke="var(--text-disabled)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                />
            </svg>
            <CurrentLocation {...here} />
            <StatusBar />
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
    mark: {
        position: "absolute",
        inset: 0,
    },
} satisfies Record<string, CSSProperties>;
