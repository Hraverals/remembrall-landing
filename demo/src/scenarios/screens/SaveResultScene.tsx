// 저장 결과 모달(앱 features/save-result SaveResultScreen). 03 분석 중 · 02 · 02b 되묻기를 그린다. 수치는 앱 theme/metrics 와 같다.
// 틀(ResultFrame): 닫기(X 24, 사방 12) 줄 → 원본 영상 머리(SourceHeader) → 본문 → 빈 공간 → 아래 버튼(좌우 20, 아래 제스처 막대 + 32).
// - 원본 영상 머리: 썸네일 폭 96(원래 색) · 배지(03 "분석 중", 02 는 없음) · "방금 저장 · YouTube Shorts" · “제목” · 계정. 위 8 · 좌우 20 · 사이 16 · 글 사이 6.
// - 03: 문구(위 32 · 사이 8) + 정지 스켈레톤 카드 2장(앱 AnalyzingSkeleton, 움직임 없음) + Secondary "닫고 기다릴게요".
// - 02: 문구 + 선택지(위 20 · 사이 8, 높이 70) + Primary "{장소}으로 저장" · Text "나중에 고를게요"(사이 4).
//   선택지는 선택되면 text/primary 테두리 1.5 + Check 20, 아니면 border/default 테두리 1(padding 에서 테두리를 빼 높이가 같다).
//   saving 이면 Primary 문구가 "저장하고 있어요"이고 두 버튼이 비활성이다. 탭 대상: Primary(confirm-save).
import type { CSSProperties } from "react";

import { AppButton } from "../../kit/ui/AppButton";
import { Badge } from "../../kit/ui/Badge";
import { Icon } from "../../kit/ui/Icon";
import {
    NAV_BAR_HEIGHT,
    NavigationBar,
    STATUS_BAR_HEIGHT,
    StatusBar,
} from "../../kit/ui/StatusBar";
import { Thumb } from "../../kit/ui/Thumb";
import type { PhotoId } from "../../kit/assets/photos";
import {
    ANALYZING_COPY,
    confirmCopy,
    type OptionView,
    SAVING_LABEL,
    withRo,
} from "./saveResult";

export type SourceVideo = {
    photo: PhotoId;
    title: string;
    handle: string;
};

type Props =
    | { state: "analyzing"; source: SourceVideo }
    | {
          state: "confirm";
          source: SourceVideo;
          options: readonly OptionView[];
          selected: number;
          saving: boolean;
      };

// 앱 metrics.skeleton
const SKELETON: readonly (readonly { width: number; height: number }[])[] = [
    [
        { width: 140, height: 14 },
        { width: 90, height: 10 },
    ],
    [
        { width: 110, height: 14 },
        { width: 60, height: 10 },
    ],
];

const SOURCE_META = "방금 저장 · YouTube Shorts";

export function SaveResultScene(props: Props) {
    const { source } = props;
    return (
        <div style={styles.screen}>
            <StatusBar />
            <div style={styles.topBar}>
                <Icon name="close" size={24} />
            </div>

            <div style={styles.source}>
                <Thumb id={source.photo} fade="recent" width={96} />
                <div style={styles.info}>
                    {props.state === "analyzing" && (
                        <div>
                            <Badge status="analyzing" />
                        </div>
                    )}
                    <p style={styles.caption}>{SOURCE_META}</p>
                    <p style={styles.title}>“{source.title}”</p>
                    <p style={styles.caption}>{source.handle}</p>
                </div>
            </div>

            {props.state === "analyzing" ? (
                <Analyzing />
            ) : (
                <Confirm {...props} />
            )}

            <NavigationBar />
        </div>
    );
}

function Message({ heading, body }: { heading: string; body: string }) {
    return (
        <div style={styles.message}>
            <p style={styles.heading}>{heading}</p>
            <p style={styles.body}>{body}</p>
        </div>
    );
}

function Analyzing() {
    return (
        <>
            <Message
                heading={ANALYZING_COPY.heading}
                body={ANALYZING_COPY.body}
            />
            <div style={styles.list}>
                {SKELETON.map((bars, cardIndex) => (
                    <div key={cardIndex} style={styles.card}>
                        {bars.map((bar, barIndex) => (
                            <span
                                key={barIndex}
                                style={{
                                    ...styles.bar,
                                    width: bar.width,
                                    height: bar.height,
                                    borderRadius: bar.height / 2,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div style={styles.spacer} />
            <div style={styles.actions}>
                <AppButton kind="secondary" label={ANALYZING_COPY.wait} />
            </div>
        </>
    );
}

function Confirm({
    options,
    selected,
    saving,
}: {
    options: readonly OptionView[];
    selected: number;
    saving: boolean;
}) {
    const chosen = options[selected] ?? options[0];
    const copy = confirmCopy(options.length);
    return (
        <>
            <Message heading={copy.heading} body={copy.body} />
            <div style={styles.list}>
                {options.map((option) => (
                    <PlaceOption
                        key={option.id}
                        option={option}
                        selected={option.id === chosen?.id}
                    />
                ))}
            </div>
            <div style={styles.spacer} />
            {chosen != null && (
                <div style={styles.actions}>
                    <div data-rmd-target="confirm-save">
                        <AppButton
                            kind="primary"
                            label={
                                saving
                                    ? SAVING_LABEL
                                    : `${withRo(chosen.name)} 저장`
                            }
                            disabled={saving}
                        />
                    </div>
                    <AppButton
                        kind="text"
                        label={copy.later}
                        disabled={saving}
                    />
                </div>
            )}
        </>
    );
}

// 앱 metrics.placeOption: 좌우 16 · 위아래 14(테두리 제외), Check 20. stroke thin 1 · medium 1.5.
function PlaceOption({
    option,
    selected,
}: {
    option: OptionView;
    selected: boolean;
}) {
    const border = selected ? 1.5 : 1;
    return (
        <div
            style={{
                ...styles.option,
                padding: `${14 - border}px ${16 - border}px`,
                border: `${border}px solid ${
                    selected ? "var(--text-primary)" : "var(--border-default)"
                }`,
            }}
        >
            <div style={styles.optionText}>
                <span style={styles.optionName}>{option.name}</span>
                {option.address != null && (
                    <span style={styles.optionAddress}>{option.address}</span>
                )}
            </div>
            {selected && <Icon name="check" size={20} />}
        </div>
    );
}

const ellipsis: CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
};

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        paddingTop: STATUS_BAR_HEIGHT,
        paddingBottom: NAV_BAR_HEIGHT + 32,
        background: "var(--bg-screen)",
    },
    topBar: {
        display: "flex",
        padding: 12,
    },
    source: {
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
        padding: "8px 20px 0",
    },
    info: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
    },
    caption: {
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    title: {
        font: "var(--type-body)",
        color: "var(--text-primary)",
    },
    message: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "32px 20px 0",
    },
    heading: {
        font: "var(--type-heading-screen)",
        letterSpacing: "var(--tracking-heading-screen)",
        color: "var(--text-primary)",
    },
    body: {
        font: "var(--type-body)",
        color: "var(--text-secondary)",
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "20px 20px 0",
    },
    card: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 16,
        borderRadius: "var(--radius-md)",
        background: "var(--bg-surface)",
    },
    bar: {
        display: "block",
        background: "var(--bg-subtle)",
    },
    spacer: {
        flex: 1,
    },
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingInline: 20,
    },
    option: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: "var(--radius-md)",
        background: "var(--bg-surface)",
    },
    optionText: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 0,
    },
    optionName: {
        ...ellipsis,
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
        color: "var(--text-primary)",
    },
    optionAddress: {
        ...ellipsis,
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
} satisfies Record<string, CSSProperties>;
