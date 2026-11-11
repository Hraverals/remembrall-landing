# 발표자료(PPT) 이어서 작업하기 — 새 세션용 프롬프트

아래 내용을 새 Claude Code 세션 첫 메시지로 붙여넣으세요.

---

REMEMBRALL(카카오테크캠퍼스 충남대 3팀 - 파워레인저) 발표자료를 이어서 수정하는 작업이다. 작업 디렉터리는 `/Users/k1ma9ree/Project/remembrall-landing/presentation`. 먼저 `README.md`와 `deck/project/deck.json`을 읽고 시작해라.

## 덱이 있는 곳

- claude.ai Slides 아티팩트: https://claude.ai/artifact/JbzHePMX3Trj193Ptj1g8N
- 원본 파일: `deck/project/deck.json`(순서·섹션·폰트) + `deck/project/slides/<id>.html`(슬라이드 26장, 한 파일에 `<section>` 하나 + 마지막에 `<aside>` 발표자 노트)
- 이미지: `deck/assets/*.png`. 덱 안에서는 `/_blob/<id>` 주소를 쓴다. 파일명 ↔ blob id 대응표는 이전 README에서 지워졌으니 필요하면 슬라이드 HTML의 `<img src>`에서 확인해라.
- 수정 방법: 슬라이드 파일을 고친 뒤 Artifact 도구로 publish. `url` = 위 링크, `root` = `presentation/deck`, `file_path` = 바뀐 슬라이드의 절대 경로, 나머지 바뀐 파일은 `files`에. 바뀐 파일만 보내면 된다. 순서·추가·삭제가 있을 때만 `deck.json`도 보낸다. 수정 전에 아티팩트를 `read`로 한 번 읽어야 publish가 받아들여진다.
- `index.html`은 빌드 결과물이다. 직접 고치지 말고 `python3 build/build.py`로 다시 만든다(`build/shell.html`이 뷰어 템플릿). 사용자가 요청할 때만 빌드한다.

## 절대 하지 말 것

- git 명령을 실행하지 마라(add, commit, push, branch 전부). 사용자가 직접 한다.
- 파일 수정과 아티팩트 publish만 해라.
- 질문은 작업을 다 끝낸 뒤 마지막에 한 번에 모아서 해라. 사용자는 자리를 자주 비운다.
- 확인하지 않은 사실을 슬라이드에 넣지 마라. 근거는 `materials/background.md`, `materials/competitor.md`, `대본자료.md`(장별 내용-출처 목록), `대본.md`(장별 전체 대본), 그리고 레포 `/Users/k1ma9ree/Project/remembrall`의 문서(`backend/docs`, `docs/`, `frontend/STRUCTURE.md`, `AI/평가셋.md`)에 있다.

## 디자인 규칙 (사용자가 정한 것)

- 슬라이드에는 짧은 제목과 키워드·그래프만. 설명 문장을 넣지 않는다. 설명은 발표자 노트(`<aside>`)에.
- 수치는 숫자만 박지 말고 그래프(도넛·막대·격자 등)로 보여준다.
- 1~2번(표지·목차)은 컬러, 3~8번(배경·문제·전환 질문)은 흑백, 9번부터 컬러.
  - 흑백 구간: 배경 `#F5F5F3`, 글자 `#161616`, 헤딩 Noto Sans KR Bold
  - 컬러 구간: 배경 `#F6F1EE`(아이보리), 카드 `#FFFCFA`, 포인트 `#6B4E7A`(자두색), 글자 `#2A2126` / 보조 `#6A5D61`, 헤딩 Gowun Dodum
  - 자두색 면은 "다시 꺼낸 순간"에만, 화면당 한 곳(앱 디자인 규칙과 동일)
- 상단에 섹션 내비(배경·문제·솔루션·기술·차별화·로드맵·팀·시연)와 진행 막대가 있다. 슬라이드마다 직접 적혀 있으니 추가·삭제 시 같이 맞춘다.
- 표지 아이콘은 정지 이미지. 로고 모션(`<x-embed>` CSS 애니메이션, 앱 실행 모션 「떠오르는 계단」과 같은 타이밍)은 9번 `reveal`과 26번 `end`에만.
- 팀명 표기는 "충남대 3팀 - 파워레인저".
- 슬라이드 형식 규칙은 아티팩트 타입 지침을 따른다(1920×1080, 인라인 스타일만, `margin` 금지, `<x-icon>` `<x-connector>` 사용 가능).

## 현재 상태 (2026-11-10)

- 슬라이드 26장 완성, 아티팩트에 반영됨(버전 24).
- 순서: cover, contents, bg-search, bg-habit, prob-defer, prob-forget, prob-why, turn, reveal, flow, scr-save, scr-recall, scr-notify, scr-onboard, tech-arch, tech-place, tech-geofence, tech-agent, tech-eval, tech-fail, diff, roadmap, bm, team, demo, end
- 발표자 노트(`<aside>`)는 '자료 정리' 형식(■ 항목별 bullet)이다. 사용자가 노트를 `대본.md` 내용으로 바꿔 달라고 하면 그때 바꾼다.
- `index.html`은 노트가 한 단계 이전 버전이다. 슬라이드 본문은 최신.

## 남은 일 / 비어 있는 자리

- `team`: 팀원 사진 6장 자리가 점선 원으로 비어 있다. 사진을 받으면 `deck/assets/`에 넣고 아티팩트에 업로드(`asset: true`)한 뒤 `<img>`로 교체.
- `demo`: 시연 영상 자리가 비어 있다. YouTube 링크를 받으면 넣는다.
- 분량이 10분보다 길다(노트 기준 약 13분). 줄인다면 `tech-fail`(20번)이나 `scr-onboard`(14번)가 후보. 사용자 결정 필요.
- 레포 문서끼리 안 맞는 것: 알림 쿨다운(코드 2시간 / 일부 문서 10분 / 잠금화면 시안 "하루 한 번"), 장소 추출 건수(평가셋 머리말 44건 / 본문 합계 59건, 슬라이드는 59 사용), 평가 모델(2.5 Flash 시점 측정, 현재 코드 3.8 Flash). 슬라이드를 고칠 때 이 숫자를 건드리면 사용자에게 알려라.

## 참고 파일

- `대본.md`: 장별 전체 대본(길게). 다른 세션에서 작성·수정 중.
- `대본자료.md`: 장별 "내용 - 출처" 목록.
- `materials/background.md`: 배경·문제 통계와 출처 URL.
- `materials/competitor.md`: 경쟁 서비스 조사.
- Figma 원본: 파일 `1AzfnPqKjUZSqYLYC31kaR`, Main 페이지. 화면 캡처는 이미 `deck/assets/`에 있다.
