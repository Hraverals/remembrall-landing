// 저장 결과(03 분석 중 · 02 · 02b 되묻기) 화면 값. 순수 함수. 앱 레포 develop 규칙을 그대로 옮긴 것이다.
// - withRo: frontend/src/features/save-result/particle.ts
// - optionViews · shortAddress: frontend/src/features/save-result/confirmView.ts 의 toOptionViews · shortAddress
// - ANALYZING_COPY · confirmCopy: frontend/src/features/save-result/SaveResultScreen.tsx
// 문구는 서버 question 을 쓰지 않는 고정 문구다. "여기 없어요, 직접 찾을게요" 행은 앱에서 숨겨져 있어 옮기지 않는다.

// "{장소}으로 저장" 의 조사. 받침이 있으면 "으로", 없거나 ㄹ 받침이면 "로".
// 마지막 글자가 한글이 아니면(영문 · 숫자 · 기호) 조사를 정할 수 없어 장소명 대신 "이곳으로"를 쓴다("CAFE 9" → "이곳으로 저장").
const FALLBACK = "이곳으로";

export function withRo(word: string): string {
    const code = word.charCodeAt(word.length - 1) - 0xac00;
    if (Number.isNaN(code) || code < 0 || code > 0xd7a3 - 0xac00) {
        return FALLBACK;
    }
    const jong = code % 28;
    return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
}

const LOCATIONIQ_COUNTRY = "대한민국";
const POSTCODE = /^\d+$/;

// null · 빈 문자열은 없는 것으로 본다.
function present(value: string | null | undefined): string | undefined {
    return value == null || value === "" ? undefined : value;
}

// LocationIQ 형식(쉼표로 나뉘고 "대한민국"으로 끝남)이면 장소명과 같은 조각 · 우편번호(숫자만) · "대한민국"을 빼고
// 순서를 뒤집어 띄어쓰기로 잇는다("성심당, 대종로480번길, 은행동, 중구, 대전, 34917, 대한민국" → "대전 중구 은행동 대종로480번길").
// 그 밖의 형식은 원문 그대로. 비면 undefined.
export function shortAddress(
    address: string | null,
    name: string,
): string | undefined {
    const raw = present(address?.trim() ?? null);
    if (raw == null) return undefined;
    const parts = raw
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part !== "");
    if (parts.length < 2 || parts[parts.length - 1] !== LOCATIONIQ_COUNTRY) {
        return raw;
    }
    const kept = parts.filter(
        (part) =>
            part !== LOCATIONIQ_COUNTRY &&
            !POSTCODE.test(part) &&
            part !== name,
    );
    return present(kept.reverse().join(" "));
}

// 서버 되묻기 선택지(ConfirmCandidateResponse.options 한 개)의 모양.
export type RawOption = {
    candidateId: string;
    name: string | null;
    branchName: string | null;
    address: string | null;
};

export type OptionView = { id: string; name: string; address?: string };

// 1줄은 "{이름} {지점}"(이름에 지점이 이미 있으면 그대로), 2줄은 shortAddress(비면 숨김).
// 이름이 빈 선택지는 빼고, 다듬은 뒤 두 줄이 같은 선택지는 첫 번째만 남긴다.
export function optionViews(options: readonly RawOption[]): OptionView[] {
    const views: OptionView[] = [];
    for (const option of options) {
        const name = present(option.name);
        if (name == null) continue;
        const branch = present(option.branchName);
        const view: OptionView = {
            id: option.candidateId,
            name:
                branch != null && !name.includes(branch)
                    ? `${name} ${branch}`
                    : name,
            address: shortAddress(option.address, name),
        };
        const duplicate = views.some(
            (kept) => kept.name === view.name && kept.address === view.address,
        );
        if (!duplicate) views.push(view);
    }
    return views;
}

// 03 본문은 실측 평균(59초)에 맞춘 앱 문구다.
export const ANALYZING_COPY = {
    heading: "영상 속 장소를 찾고 있어요",
    body: "보통 1분쯤 걸려요. 이 화면을 닫아도 계속 찾아요.",
    wait: "닫고 기다릴게요",
} as const;

export const SAVING_LABEL = "저장하고 있어요";

// 02 확인 필요 문구는 후보 수로 가른다. 1곳이면 02b.
export function confirmCopy(count: number) {
    if (count === 1) {
        return {
            heading: "이 영상, 여기가 맞나요?",
            body: "영상에서 1곳을 찾았어요. 여기가 맞는지 확인해주세요.",
            later: "나중에 확인할게요",
        };
    }
    return {
        heading: "이 영상, 어디였을까요?",
        body: `영상에서 ${count}곳을 찾았어요. 맞는 곳을 골라주세요.`,
        later: "나중에 고를게요",
    };
}
