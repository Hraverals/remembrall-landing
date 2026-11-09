// 저장 시각으로 정하는 화면 값. 순수 함수. 앱 레포 규칙을 옮긴 것이다.
// - fadeFor · savedAgo: frontend/src/shared/ui/savedAt.ts
// - seasonSection · toAlbumSections: frontend/src/features/archive/albumSections.ts
// - nearbyBody: frontend/src/shared/api/notificationsMock.ts 의 nearbyNotificationBody
// 바램: 7일 미만 recent, 30일 미만 weeks, 그 이상 months. 섹션: recent "이번 주", weeks "지난 몇 주", months 는 계절(3~5 봄 …, 12월은 다음 해 겨울).
// 셀 이름: 장소가 확정되면 장소명, 분석 중이고 제목이 없으면 "제목 없는 영상". 배지는 분석 중만 쓴다(데모에 다른 상태가 없다).
import type { PhotoId } from "../../kit/assets/photos";
import type { Fade } from "../../kit/ui/fade";

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 7;
const WEEKS_DAYS = 30;
const YEAR_DAYS = 365;
const SEASONS = ["겨울", "봄", "여름", "가을"] as const;

// 바램 불투명도(FADE_OPACITY · FADE_VALUE · fadeOpacity)는 kit/ui/fade.ts 에 있다(kit ui 도 쓴다).

export type DemoSave = {
    id: string;
    place: string;
    photo: PhotoId;
    savedAt: Date;
    analyzing?: boolean;
};

export type AlbumItem = {
    save: DemoSave;
    label: string;
    fade: Fade;
    badge?: "analyzing";
};

export type AlbumSection = {
    key: string;
    title: string;
    items: AlbumItem[];
};

export function fadeFor(savedAt: Date, now: Date): Fade {
    const days = (now.getTime() - savedAt.getTime()) / DAY_MS;
    if (days < RECENT_DAYS) return "recent";
    if (days < WEEKS_DAYS) return "weeks";
    return "months";
}

export function savedAgo(savedAt: Date, now: Date): string {
    const ms = now.getTime() - savedAt.getTime();
    const days = ms / DAY_MS;
    if (ms < 60 * 1000) return "방금";
    if (ms < 60 * 60 * 1000) return `${Math.floor(ms / 60000)}분 전`;
    if (ms < DAY_MS) return `${Math.floor(ms / 3600000)}시간 전`;
    if (days < RECENT_DAYS) return `${Math.floor(days)}일 전`;
    if (days < WEEKS_DAYS) return `${Math.floor(days / 7)}주 전`;
    if (days < YEAR_DAYS) return `${Math.floor(days / WEEKS_DAYS)}개월 전`;
    return `${Math.floor(days / YEAR_DAYS)}년 전`;
}

export function nearbyBody(savedAt: Date, now: Date): string {
    const ago = savedAgo(savedAt, now);
    return ago === "방금"
        ? "방금 저장한 곳이 근처에 있어요"
        : `${ago}에 저장한 곳이 근처에 있어요`;
}

function seasonSection(savedAt: Date, now: Date) {
    const month = savedAt.getMonth() + 1;
    const year =
        month === 12 ? savedAt.getFullYear() + 1 : savedAt.getFullYear();
    const season = SEASONS[Math.floor((month % 12) / 3)];
    const ago = now.getFullYear() - year;
    const yearLabel = ago <= 0 ? "올해" : ago === 1 ? "지난해" : `${year}년`;
    return { key: `${year}-${season}`, title: `${yearLabel} ${season}` };
}

// saves 는 최신 저장순이다. 같은 섹션은 이어서 온다.
export function toAlbumSections(
    saves: readonly DemoSave[],
    now: Date,
): AlbumSection[] {
    const sections: AlbumSection[] = [];
    for (const save of saves) {
        const fade = fadeFor(save.savedAt, now);
        const { key, title } =
            fade === "recent"
                ? { key: "recent", title: "이번 주" }
                : fade === "weeks"
                  ? { key: "weeks", title: "지난 몇 주" }
                  : seasonSection(save.savedAt, now);
        const item: AlbumItem = save.analyzing
            ? { save, label: "제목 없는 영상", fade, badge: "analyzing" }
            : { save, label: save.place, fade };
        const last = sections[sections.length - 1];
        if (last?.key === key) last.items.push(item);
        else sections.push({ key, title, items: [item] });
    }
    return sections;
}
