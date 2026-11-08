// 저장물 썸네일. 앱 C/Thumb. 9:16 사진 위에 bg/fade 를 덮어 오래 잊은 것일수록 바래게 한다.
// 폰 화면 안(논리 px)에서만 쓴다. 스타일은 앱 StyleSheet 과 나란히 비교할 수 있게 객체로 둔다.
import type { CSSProperties } from "react";

import { photo, type PhotoId } from "../../assets/photos";
import { Icon } from "./Icon";

export type Fade = "recent" | "weeks" | "months";

const FADE_OPACITY: Record<Fade, string> = {
    recent: "var(--fade-recent)",
    weeks: "var(--fade-weeks)",
    months: "var(--fade-months)",
};

// sm(270 폭)은 화면 배율 1 · DPR 2 기준 135 논리 px 까지 충분하다.
const SM_MAX_WIDTH = 135;

type Props = {
    id: PhotoId;
    fade: Fade;
    width: number;
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
                width,
                height: (width * 16) / 9,
                borderRadius: radius,
            }}
        >
            <img
                src={photo(id, width > SM_MAX_WIDTH ? "lg" : "sm")}
                alt=""
                decoding="async"
                style={styles.fill}
            />
            <div
                data-fade={fade}
                style={{
                    ...styles.fill,
                    ...styles.fade,
                    opacity: FADE_OPACITY[fade],
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
