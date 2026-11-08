// 2 공유 받음 시트(앱 features/share-received · ModalSheet). 앱은 지금 화면 위에 띄운다. 데모는 마지막으로 본 화면이 지도 탭(T0)인 경우다.
// 저장 중: "저장하고 있어요", 두 버튼은 비활성으로 보인다(높이가 바뀌지 않게 버튼을 남긴다).
// 저장함: "저장했어요" + 앱 본문 두 줄. Primary "돌아가기", Text "기억 탭 보기".
// 썸네일은 바램 없는 원래 색이다(방금 저장한 기억이 가장 선명하다).
// enter: 막 · 시트가 올라온 정도 0~1, text: "저장했어요" 문구가 나타난 정도 0~1. 탭 대상: "기억 탭 보기"(open-archive).
// 뒤 지도에는 성심당 핀이 없다(아직 분석 전이라 장소를 모른다).
import type { CSSProperties } from "react";

import { DEMO_NOW, shorts } from "../data";
import { AppButton } from "../ui/AppButton";
import { NAV_BAR_HEIGHT, NavigationBar } from "../ui/StatusBar";
import { Thumb } from "../ui/Thumb";
import { MapScene } from "./MapScene";

const COPY = {
    saving: { title: "저장하고 있어요" },
    saved: {
        title: "저장했어요",
        body: "어디인지 찾으면 기억 탭에 넣어둘게요.\n그 근처에 가면 다시 꺼내드려요.",
    },
} as const;

type Props = {
    status: "saving" | "saved";
    enter: number;
    text: number;
};

export function ReceivedScene({ status, enter, text }: Props) {
    const copy = COPY[status];
    const saving = status === "saving";
    const textOpacity = saving ? 1 : text;
    return (
        <div style={styles.screen}>
            <MapScene
                now={DEMO_NOW}
                walk={0}
                notified={false}
                newSave={false}
            />
            <div style={{ ...styles.overlay, opacity: enter }} />

            <div
                style={{
                    ...styles.sheet,
                    transform: `translateY(${(1 - enter) * 100}%)`,
                }}
            >
                <div style={styles.gripRow}>
                    <span style={styles.grip} />
                </div>
                <div style={styles.content}>
                    <div style={styles.body}>
                        <Thumb id={shorts.photo} fade="recent" width={72} />
                        <div style={{ ...styles.text, opacity: textOpacity }}>
                            <p style={styles.heading}>{copy.title}</p>
                            {"body" in copy && (
                                <p style={styles.caption}>{copy.body}</p>
                            )}
                        </div>
                    </div>
                    <div style={styles.actions}>
                        <AppButton
                            kind="primary"
                            label="돌아가기"
                            disabled={saving}
                        />
                        <div data-demo-target="open-archive">
                            <AppButton
                                kind="text"
                                label="기억 탭 보기"
                                disabled={saving}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <NavigationBar />
        </div>
    );
}

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        background: "var(--bg-overlay)",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        background: "var(--bg-surface)",
    },
    // 손잡이 36 × 4(border/default), 위 8 · 아래 12.
    gripRow: {
        display: "flex",
        justifyContent: "center",
        padding: "8px 0 12px",
    },
    grip: {
        width: 36,
        height: 4,
        borderRadius: 2,
        background: "var(--border-default)",
    },
    // 내용 위 8 · 좌우 20 · 아래 32 + 제스처 막대.
    content: {
        padding: `8px 20px ${32 + NAV_BAR_HEIGHT}px`,
    },
    body: {
        display: "flex",
        alignItems: "flex-end",
        gap: 20,
    },
    text: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    heading: {
        font: "var(--type-heading-screen)",
        letterSpacing: "var(--tracking-heading-screen)",
    },
    caption: {
        font: "var(--type-body)",
        color: "var(--text-secondary)",
        whiteSpace: "pre-line",
    },
    // 버튼 묶음: 위 32, 사이 4.
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingTop: 32,
    },
} satisfies Record<string, CSSProperties>;
