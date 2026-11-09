// 08 장소 상세. 지도 위에 시트. 시트 구성과 수치는 앱 features/content-detail(DetailSheet · DetailFooter)과 같다.
// 지도: 현재 위치 → 장소 점선 경로(text/secondary 2, 점선 4 · 4), 장소 사진 핀(폭 40, 테두리 3, 그림자)과 이름표.
// 바램은 앱 savedPlaceSheet 과 같다. fade 는 핀 · 썸네일의 바램(근처에서 연 08 이면 원래 색 recent)이고,
// thumbFade 는 썸네일만 따로 준다(앱 restoreFrom: 근처에서 열면 썸네일만 저장 시각대로의 바램에서 600ms 동안 풀린다). 없으면 fade.
// detail: 시트 내용. 없으면 3주 전에 저장한 성심당 본점(S5). 저장 결과에서 바로 연 08 은 저장 시점이 "방금"이다(S3).
//   badge · benefit 은 S6 컨셉 08d(광고 장소 · 도착 혜택)에만 있다: info 맨 위 "광고" 배지(bg/subtle, 11/500, radius sm),
//   메모 아래 도착 혜택 카드(bg/subtle, radius md, 안쪽 12 · 14). 둘 다 강조색을 쓰지 않는다(주 버튼은 "길 안내 시작" 하나).
// map: 지도 위 장소 · 지금 위치(360×800 논리 px). 없으면 성심당 08 배치(detailMap).
import type { CSSProperties } from "react";

import type { PhotoId } from "../../kit/assets/photos";
import type { Point } from "../../kit/ui/geo";
import { detailMap, sungsimdang } from "./data";
import { AppButton } from "../../kit/ui/AppButton";
import { DemoMap } from "../../kit/ui/DemoMap";
import { Icon } from "../../kit/ui/Icon";
import {
    CurrentLocation,
    PhotoPin,
    PinLabel,
    RouteLine,
} from "../../kit/ui/MapMarkers";
import {
    NAV_BAR_HEIGHT,
    NavigationBar,
    StatusBar,
    STATUS_BAR_HEIGHT,
} from "../../kit/ui/StatusBar";
import type { Fade } from "../../kit/ui/fade";
import { Thumb } from "../../kit/ui/Thumb";

export type DetailContent = {
    time: string;
    place: string;
    address: string;
    walk: string;
    photo: PhotoId;
    note: string;
    tags: readonly string[];
    sourceMeta: string;
    badge?: string;
    benefit?: { label: string; title: string; note: string };
};

type Props = {
    fade: Fade;
    thumbFade?: Fade | number;
    detail?: DetailContent;
    map?: { place: Point; current: Point };
};

export function DetailScene({
    fade,
    thumbFade = fade,
    detail = sungsimdang,
    map = detailMap,
}: Props) {
    const { place, current } = map;
    return (
        <div style={styles.screen}>
            <DemoMap />
            <RouteLine from={current} to={place} />
            <CurrentLocation {...current} />
            <PhotoPin
                {...place}
                photo={detail.photo}
                fade={fade}
                variant="detail"
            />
            <PinLabel {...place} label={detail.place} />

            <StatusBar />

            <div style={styles.back}>
                <Icon name="arrowLeft" size={22} />
            </div>

            <div style={styles.sheet}>
                <div style={styles.handleRow}>
                    <span style={styles.handle} />
                </div>
                <div style={styles.body}>
                    <div style={styles.head}>
                        <Thumb id={detail.photo} fade={thumbFade} width={72} />
                        <div style={styles.info}>
                            {detail.badge != null && (
                                <span style={styles.badge}>{detail.badge}</span>
                            )}
                            <p style={styles.time}>{detail.time}</p>
                            <p style={styles.place}>{detail.place}</p>
                            <p style={styles.caption}>
                                {detail.address} · {detail.walk}
                            </p>
                        </div>
                    </div>

                    <div style={styles.note}>
                        <p style={styles.caption}>영상에서 저장해둔 것</p>
                        <p style={styles.noteBody}>{detail.note}</p>
                        <div style={styles.tags}>
                            {detail.tags.map((tag) => (
                                <span key={tag} style={styles.tag}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {detail.benefit != null && (
                        <div style={styles.benefit}>
                            <p style={styles.caption}>{detail.benefit.label}</p>
                            <p style={styles.benefitTitle}>
                                {detail.benefit.title}
                            </p>
                            <p style={styles.caption}>{detail.benefit.note}</p>
                        </div>
                    )}

                    <div style={styles.source}>
                        <div style={styles.sourceText}>
                            <p style={styles.sourceTitle}>
                                원본 영상 다시 보기
                            </p>
                            <p style={styles.caption}>{detail.sourceMeta}</p>
                        </div>
                        <Icon name="chevronRight" size={18} />
                    </div>
                </div>

                <div style={styles.actions}>
                    <AppButton kind="primary" label="길 안내 시작" />
                    <AppButton kind="text" label="이 장소가 아니에요" />
                </div>
            </div>

            <NavigationBar />
        </div>
    );
}

const oneLine: CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
};

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "var(--bg-screen)",
    },
    // 뒤로가기: 상태 표시줄 아래 md, 왼쪽 16, 38 원.
    back: {
        position: "absolute",
        top: STATUS_BAR_HEIGHT + 12,
        left: 16,
        display: "grid",
        placeItems: "center",
        width: 38,
        height: 38,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-surface)",
        boxShadow: "var(--elevation-low)",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        background: "var(--bg-surface)",
        boxShadow: "var(--elevation-low)",
    },
    // 핸들: 위 10, 36 × 4.
    handleRow: {
        display: "flex",
        justifyContent: "center",
        paddingTop: 10,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        background: "var(--bg-placeholder)",
    },
    // 핸들 아래 16, 좌우 20, 묶음 사이 16.
    body: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px 20px 0",
    },
    head: {
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
    },
    info: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    time: {
        ...oneLine,
        font: "var(--type-heading-screen)",
        letterSpacing: "var(--tracking-heading-screen)",
    },
    place: {
        ...oneLine,
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
    },
    caption: {
        ...oneLine,
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    note: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    // 기본 지점에서 메모는 2줄로 줄인다.
    noteBody: {
        font: "var(--type-body)",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    badge: {
        alignSelf: "flex-start",
        marginBottom: 2,
        padding: "2px 6px",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-subtle)",
        color: "var(--text-on-subtle)",
        font: "500 11px / 14px var(--font-body)",
    },
    benefit: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-subtle)",
    },
    benefitTitle: {
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
    },
    tags: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
    },
    tag: {
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-subtle)",
        color: "var(--text-on-subtle)",
        font: "var(--type-caption)",
    },
    // 원본 영상 줄: 높이 64, 테두리 1 은 크기 안쪽.
    source: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 64,
        padding: "0 12px 0 14px",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
    },
    sourceText: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    sourceTitle: {
        ...oneLine,
        font: "var(--type-label-button)",
    },
    // 하단 버튼: 시트 간격 16 뒤, 버튼 사이 4, 아래 24 + 제스처 막대.
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: `16px 20px ${24 + NAV_BAR_HEIGHT}px`,
    },
} satisfies Record<string, CSSProperties>;
