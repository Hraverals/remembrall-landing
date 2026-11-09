// 저장물 썸네일. 앱 C/Thumb. 9:16 사진 위에 bg/fade 를 덮어 오래 잊은 것일수록 바래게 한다.
// 폰 화면 안에서는 width(논리 px)를 준다. width 를 빼면 부모 폭을 채우고 9:16 을 지킨다(페이지 섹션용, 사진은 lg).
// 바램 층에는 data-thumb-fade 가 있어 페이지 CSS 가 전환을 걸 수 있다. 스타일은 앱 StyleSheet 과 나란히 비교할 수 있게 객체로 둔다.
import type { CSSProperties } from "react";

import { photo, type PhotoId } from "../assets/photos";
import { type Fade, fadeOpacity } from "./fade";
import { Icon } from "./Icon";

// sm(270 폭)은 화면 배율 1 · DPR 2 기준 135 논리 px 까지 충분하다.
const SM_MAX_WIDTH = 135;

type Props = {
    id: PhotoId;
    // 단계 또는 불투명도 숫자(전환 중).
    fade: Fade | number;
    width?: number;
    radius?: number;
    showSource?: boolean;
};

export function Thumb({
    id,
    fade,
    width,
    radius = 12,
    showSource = true,
}: Props) {
    return (
        <div
            style={{
                ...styles.frame,
                ...(width == null
                    ? { width: "100%", aspectRatio: "9 / 16" }
                    : { width, height: (width * 16) / 9 }),
                borderRadius: radius,
            }}
        >
            <img
                src={photo(
                    id,
                    width != null && width <= SM_MAX_WIDTH ? "sm" : "lg",
                )}
                alt=""
                decoding="async"
                style={styles.fill}
            />
            <div
                data-thumb-fade
                data-fade={typeof fade === "number" ? undefined : fade}
                style={{
                    ...styles.fill,
                    ...styles.fade,
                    opacity: fadeOpacity(fade),
                }}
            />
            {showSource && (
                <div style={styles.source}>
                    <span style={styles.play}>
                        <Icon
                            name="play"
                            size={12}
                            color="var(--text-on-primary)"
                        />
                    </span>
                </div>
            )}
        </div>
    );
}

const styles = {
    // 사진이 뜨기 전에는 bg/placeholder 가 보인다.
    frame: {
        position: "relative",
        flex: "none",
        overflow: "hidden",
        background: "var(--bg-placeholder)",
    },
    fill: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    fade: {
        background: "var(--bg-fade)",
    },
    // 재생 배지(source/Shorts): 20 원, 왼쪽 아래 6.
    source: {
        position: "absolute",
        left: 6,
        bottom: 6,
        width: 20,
        height: 20,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-overlay)",
    },
    play: {
        position: "absolute",
        left: 4.5,
        top: 4,
    },
} satisfies Record<string, CSSProperties>;
