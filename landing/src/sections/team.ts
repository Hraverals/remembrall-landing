// 만든 사람들. 이 파일만 고치면 된다.
//
// 채우는 방법
// - 한 사람당 { name, role, github } 하나. 사람 수에 맞게 항목을 더하거나 지운다.
// - name: 화면에 보일 이름(예: "홍길동"). 비어 있으면 그 항목은 그리지 않는다.
// - role: 맡은 일(예: "프론트엔드"). 비어 있어도 된다.
// - github: GitHub 아이디만, @ 없이(예: "Hraverals"). 링크 주소(https://github.com/아이디)는 코드가 만든다. 비어 있으면 링크만 뺀다.
// - 이름이 있는 항목이 하나도 없으면 "만든 사람들" 섹션 전체(#team)를 그리지 않는다.
export type TeamMember = { name: string; role: string; github: string };

export const TEAM: readonly TeamMember[] = [
    { name: "남준혁", role: "PM", github: "namnam-990" },
    { name: "김동희", role: "FE 리드", github: "k1m-a9ree" },
    { name: "서민규", role: "BE 리드", github: "ers5" },
    { name: "김종훈", role: "AI 리드", github: "202202571" },
    { name: "김에스더", role: "플래너", github: "estherkim0109" },
    { name: "박정현", role: "메이커", github: "Hraverals" },
];
