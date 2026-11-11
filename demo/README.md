# REMEMBRALL 발표용 시나리오 데모

10분 발표 중간중간 쓰는 시나리오별 애니메이션이다. 발표 자료(`presentation/`)는 이 문서만 보고 `src/kit/` · `src/scenarios/` 두 폴더를 복사해 쓰면 된다.
이 폴더(demo/)는 독립 Vite 프로젝트이고, 갤러리 · 녹화 모드 · 개발 도구는 `src/app/` 에 있다(복사하지 않는다).

## 1. 빠른 시작

**React 19 필요(inert · flushSync).** 폰 캔버스에 `inert` 속성을 쓰고, 비트를 옮길 때 `react-dom` 의 `flushSync` 를 쓴다. React 18 에서는 `inert` 타입 오류가 난다.

1. `demo/src/kit/` 과 `demo/src/scenarios/` 를 **나란히** 복사한다(시나리오가 `../kit/...` 로 kit 을 부른다). 예: `presentation/src/rmd/kit/` · `presentation/src/rmd/scenarios/`.
2. 의존성을 맞춘다. kit · scenarios 는 이 셋 말고 다른 패키지를 쓰지 않는다(lint 와 `npm run check:portable` 이 지킨다).

    ```
    npm install react@^19.3.1 react-dom@^19.3.1 gsap@^3.15.1
    ```

3. 번들러는 CSS(`@import` 포함) · `.webp` · `.png` · `.woff2` import 를 처리해야 한다. Vite 는 설정 없이 된다. 다른 번들러는 6장을 본다.
4. 컴포넌트를 import 하면 kit CSS · 폰트도 같이 들어온다(따로 import 할 것 없음).

<!-- example: import -->

```tsx
import { useState } from "react";

import { ScenarioPhone, ScenarioStage } from "./rmd/kit";
import { findScenario, SCENARIOS } from "./rmd/scenarios";
import { S3 } from "./rmd/scenarios/s3";
import { S5 } from "./rmd/scenarios/s5";
```

## 2. 사용 예

아래 코드는 `src/app/examples/Slides.tsx` 와 글자 그대로 같고(경로만 `./rmd/` 로 바꿈), 그 파일은 typecheck · lint 를 거친다(`npm run check:readme` 가 같은지 확인한다).

### 폰만, 슬라이드 단계 = 비트

<!-- example: phone-step -->

```tsx
// 슬라이드 단계 번호(0부터)를 그대로 beat 로 넘긴다. 부모 상자에 높이가 있어야 한다(contain).
export function PhoneSlide({ step }: { step: number }) {
    return (
        <div style={{ height: 640 }}>
            <ScenarioPhone scenario={S5} mode="step" beat={step} />
        </div>
    );
}
```

### 16:9 무대, 시작 전에서 출발

<!-- example: stage-step -->

```tsx
// 슬라이드에 들어온 첫 단계(step 0)는 시작 전(beat -1)으로 두고, → 를 누를 때마다 비트 하나씩 재생한다.
// background="transparent" 면 무대 바탕 없이 슬라이드 배경 위에 얹힌다.
export function StageSlide({ step }: { step: number }) {
    return (
        <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
            <ScenarioStage
                scenario={S3}
                mode="step"
                beat={step - 1}
                background="transparent"
            />
        </div>
    );
}
```

### 반복 재생

<!-- example: loop -->

```tsx
// 전체를 반복 재생한다. height 를 주면 그 높이(폭은 16:9)로 그린다.
export function LoopBanner() {
    return <ScenarioStage scenario={S5} mode="loop" speed={1.5} height={360} />;
}
```

### 비트가 끝나면 다음 비트로

<!-- example: auto-advance -->

```tsx
// 비트가 끝까지 재생되면 onBeatEnd(비트 번호)가 온다. 다음 비트로 넘겨 자동 진행한다(마지막 비트에서 멈춘다).
export function AutoAdvance() {
    const [beat, setBeat] = useState(0);
    const last = S3.beats.length - 1;
    return (
        <div style={{ height: 480 }}>
            <ScenarioPhone
                scenario={S3}
                mode="step"
                beat={beat}
                onBeatEnd={(ended) => setBeat(Math.min(ended + 1, last))}
            />
        </div>
    );
}
```

### 자막을 슬라이드 글로

<!-- example: captions -->

```tsx
// 등록부에서 시나리오를 꺼내 비트 자막을 슬라이드 글로 쓴다(ScenarioPhone 은 자막을 그리지 않는다).
export function CaptionList({ id }: { id: string }) {
    const scenario = findScenario(id) ?? SCENARIOS[0];
    if (scenario == null) return null;
    return (
        <ol>
            {scenario.beats.map((beat) => (
                <li key={beat.id}>{beat.caption}</li>
            ))}
        </ol>
    );
}
```

### 멈춘 화면

<!-- example: still -->

```tsx
// 특정 시각에 멈춘 화면(인쇄 · 썸네일용). at 은 mode 보다 앞선다.
export function Still() {
    const end = S5.beats[S5.beats.length - 1]?.end ?? 0;
    return <ScenarioPhone scenario={S5} mode="step" at={end} height={400} />;
}
```

### props

`ScenarioPhone` 과 `ScenarioStage` 는 같은 props 를 받는다. `background` 는 `ScenarioStage` 만 받는다.

| prop         | 타입                        | 기본       | 뜻                                                                                         |
| ------------ | --------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `scenario`   | `Scenario`                  | (필수)     | `SCENARIOS` 의 항목이나 개별 import(`S1` ~ `S6`). 하나만 쓰면 나머지는 번들에서 빠진다     |
| `mode`       | `"step" \| "loop"`          | (필수)     | step: `beat` 로 제어. loop: 전체 반복                                                      |
| `beat`       | `number`                    | `0`        | step 에서 지금 비트(0부터). `-1` 은 시작 전(t=0) 정지. 범위를 넘으면 처음 · 끝 비트로 자름 |
| `speed`      | `number`                    | `1`        | 재생 속도(타임라인 timeScale)                                                              |
| `height`     | `number`                    | 없음       | 그릴 높이(px). 폭은 비율(폰 384:824, 무대 16:9). 없으면 부모 상자에 contain                |
| `onBeatEnd`  | `(beat: number) => void`    | 없음       | 비트가 끝까지 재생됐을 때. step 은 멈춘 비트, loop 는 지나간 비트마다                      |
| `at`         | `number`                    | 없음       | 이 시각(초)에 멈춘 화면. mode 보다 앞선다(스크린샷 · 인쇄용)                               |
| `background` | `"screen" \| "transparent"` | `"screen"` | `ScenarioStage` 만. transparent 면 무대 바탕을 그리지 않는다                               |

`ScenarioPhone` 은 폰만 그린다(자막 없음). `ScenarioStage` 는 1920×1080 논리 px 무대에 폰 · 자막 · 시나리오별 옆 설명(S3 · S6)을 그리고 크기에 맞춰 줄인다. `concept: true` 인 시나리오(S6)는 무대 오른쪽 위에 "컨셉" 배지가 늘 있다.

## 3. 동작 규칙

### step

- `beat` 가 커지면 그 비트의 처음부터 끝까지 재생하고 멈춘 뒤 `onBeatEnd(beat)` 를 부른다. 두 칸 이상 건너뛰어도 마지막 비트만 재생한다.
- `beat` 가 작아지면 그 비트의 **끝 상태**로 바로 간다(뒤로 가기는 재생하지 않는다).
- 처음 준비됐을 때는 지금 `beat` 를 처음부터 재생한다.
- 비트마다 끝나기 0.5초 넘게 전에 동작 · 손가락이 끝나 있어, 멈춘 화면은 정돈돼 있다.

### 크기(contain)

`height` 를 주지 않으면 부모 상자의 **가로 · 세로 안에** 들어가는 가장 큰 크기로 그린다. 그래서 **부모 상자에 높이가 정해져 있어야 한다.** 부모 높이가 auto 면 높이 0 이 되어 보이지 않는다. 그때는 `height` 를 주거나 부모에 높이(또는 `aspect-ratio`)를 준다.

### 재생 시점 · 멈춤

- 컴포넌트가 15% 이상 화면에 보일 때 GSAP 을 동적 import 한다(별도 청크). 화면 밖으로 나가거나 탭이 숨으면 멈추고, 돌아오면 이어 간다.
- 한 화면에 여러 개를 둬도 된다(인스턴스마다 타임라인이 따로다).
- `scenario` · `mode` 가 바뀌면 새로 만든다(재생 상태가 처음으로).

### 동작 줄이기 · GSAP 로드 실패

시스템 동작 줄이기(`prefers-reduced-motion: reduce`)면 GSAP 을 부르지 않고 정지 화면을 보인다. GSAP 을 불러오지 못해도 같다.

| 상황         | 정지 화면                                                    |
| ------------ | ------------------------------------------------------------ |
| `at` 이 있음 | 그 시각                                                      |
| step         | 지금 비트의 끝 상태(`-1` 이면 t=0), `onBeatEnd` 는 바로 온다 |
| loop         | 마지막 비트의 끝 상태                                        |

손가락 표시는 동작 줄이기에서 숨는다.

## 4. 스타일 범위

- 모든 클래스는 `.rmd-` 로 시작하고, 토큰 CSS 변수(`--bg-screen` 등)는 컴포넌트 바깥 상자 `.rmd-root` 안에서만 정한다. 전역 선택자(`html` · `body` · `*` · `:root`)는 쓰지 않는다(`npm run check:portable` 이 지킨다).
- 발표 자료의 `p { … }` 같은 전역 규칙은 kit 리셋(`.rmd-root :where(p)`)보다 약해서 안에 닿지 않는다. 다만 `.slide p` 처럼 클래스가 붙은 규칙은 kit 안까지 닿을 수 있으니, kit 을 감싼 상자에는 그런 규칙을 걸지 않는다.
- 폰트는 kit 이 직접 싣는다: 패밀리 이름 `RMD Noto Sans KR`(400 · 500) · `RMD Gowun Dodum`(400). 이름 앞 "RMD " 덕분에 발표 자료의 같은 폰트와 섞이지 않는다. unicode-range 로 나뉜 woff2 라 필요한 조각만 받는다.
- 라이트 모드 고정이다(`color-scheme: light`).

## 5. 시나리오

| id  | 제목                | 비트 | 한 바퀴 | 컨셉 |
| --- | ------------------- | ---- | ------- | ---- |
| S1  | 잊힌 저장           | 2    | 8.0초   |      |
| S2  | 공유 한 번으로 저장 | 4    | 9.8초   |      |
| S3  | 영상 속 장소 찾기   | 5    | 13.2초  |      |
| S4  | 바랜 기억           | 3    | 8.4초   |      |
| S5  | 근처에서 다시       | 4    | 12.0초  |      |
| S6  | 추천에서 방문까지   | 4    | 12.8초  | 컨셉 |

한 바퀴는 마지막 비트 끝 뒤 처음 화면으로 돌아가는 0.4초 크로스페이드까지 포함한다(loop · 녹화 한 바퀴). 시각은 1배속 초다.

### S1 잊힌 저장

Remembrall 이 없을 때. Remembrall 화면 · YouTube 로고 · 고유 UI 는 없다.

| 비트 | id   | 이름   | 시각      | 자막                               |
| ---- | ---- | ------ | --------- | ---------------------------------- |
| 0    | pile | 쌓임   | 0.0 ~ 3.6 | 가 보고 싶어서 저장했는데          |
| 1    | pass | 지나침 | 3.6 ~ 7.6 | 바로 앞을 지나가도 기억나지 않아요 |

### S2 공유 한 번으로 저장

| 비트 | id        | 이름      | 시각      | 자막                                   |
| ---- | --------- | --------- | --------- | -------------------------------------- |
| 0    | share     | 공유      | 0.0 ~ 2.4 | Shorts에서 마음에 든 곳을 공유해요     |
| 1    | saved     | 저장      | 2.4 ~ 5.0 | 공유 한 번이면 저장돼요                |
| 2    | analyzing | 분석 중   | 5.0 ~ 7.2 | 영상 속 장소를 찾고 있어요             |
| 3    | resolved  | 장소 확정 | 7.2 ~ 9.4 | 어디인지 찾으면 장소 이름으로 바뀌어요 |

### S3 영상 속 장소 찾기

무대 옆에 저장 파이프라인 4단계가 비트 0 ~ 3 에 맞춰 하나씩 켜진다(영상 정보 가져오기 → AI가 영상을 보고 장소 후보 찾기 → 실제 있는 곳인지 확인 → 확실하지 않으면 물어보기).

| 비트 | id         | 이름      | 시각       | 자막                           |
| ---- | ---------- | --------- | ---------- | ------------------------------ |
| 0    | read       | 영상 읽기 | 0.0 ~ 2.4  | 닫아도 뒤에서 계속 찾아요      |
| 1    | candidates | 후보 찾기 | 2.4 ~ 4.8  | 닫아도 뒤에서 계속 찾아요      |
| 2    | verify     | 확인      | 4.8 ~ 7.2  | 닫아도 뒤에서 계속 찾아요      |
| 3    | ask        | 되묻기    | 7.2 ~ 9.8  | 어느 지점인지 모를 땐 물어봐요 |
| 4    | save       | 저장      | 9.8 ~ 12.8 | 고른 곳으로 바로 저장돼요      |

### S4 바랜 기억

| 비트 | id     | 이름     | 시각      | 자막                              |
| ---- | ------ | -------- | --------- | --------------------------------- |
| 0    | now    | 방금     | 0.0 ~ 2.0 | 방금 저장한 곳은 선명해요         |
| 1    | weeks  | 3주 뒤   | 2.0 ~ 5.0 | 3주 뒤, 사진이 조금 바래요        |
| 2    | months | 5개월 뒤 | 5.0 ~ 8.0 | 5개월 뒤, 더 바래고 계절로 묶여요 |

### S5 근처에서 다시

| 비트 | id     | 이름      | 시각       | 자막                                       |
| ---- | ------ | --------- | ---------- | ------------------------------------------ |
| 0    | walk   | 걷는 중   | 0.0 ~ 3.0  | 저장한 곳 근처를 지나가요                  |
| 1    | arrive | 알림 도착 | 3.0 ~ 5.4  | 근처에 오면 화면을 가리지 않고 알림이 와요 |
| 2    | pull   | 알림창    | 5.4 ~ 8.4  | 몇 주 전에 저장한 곳인지 알려 줘요         |
| 3    | open   | 원래 색   | 8.4 ~ 11.6 | 누르면 원래 색으로 돌아와요                |

### S6 추천에서 방문까지 (컨셉)

앱에 없는 BM 컨셉 화면이다(07e 추천 진입 · 14 추천 · 08d 도착 혜택 · 15 광고주 성과). 장소 · 채널 이름은 모두 지어낸 이름이고 숫자는 설명용 예시다. 무대 옆에 퍼널 4단계(추천 → 저장 → 근처 도착 → 혜택 사용)가 켜지고, 비트 3 에서 머리말이 "사장님 화면"으로 바뀐다. 옆 칸에는 숫자를 두지 않는다(숫자는 폰 안 15 에만, "예시" 표시와 함께 나온다).

| 비트 | id       | 이름 | 시각       | 자막                                       |
| ---- | -------- | ---- | ---------- | ------------------------------------------ |
| 0    | discover | 발견 | 0.0 ~ 2.6  | 저장한 곳 근처의 새 영상을 골라 줘요       |
| 1    | save     | 저장 | 2.6 ~ 5.2  | 광고는 표시해 두고, 다른 영상처럼 저장해요 |
| 2    | arrive   | 도착 | 5.2 ~ 9.0  | 2주 뒤 근처에서 열면 도착 혜택이 보여요    |
| 3    | report   | 성과 | 9.0 ~ 12.4 | 사장님은 저장에서 방문까지를 숫자로 봐요   |

## 6. 다른 번들러에서 쓸 때

- `kit/assets.d.ts` 가 `*.webp` · `*.png` · `*.css` import 의 타입을 선언한다. 발표 자료 tsconfig 의 `include` 가 kit 폴더를 덮으면 따로 할 일이 없다(`vite/client` 와 같이 있어도 겹치지 않는다).
- 사진 · 아이콘은 정적 import(URL 문자열)로, 폰트는 `kit/fonts/fonts.css` 의 상대 `url()` 로 부른다. webpack 5 는 asset 모듈(`type: "asset/resource"`)과 css-loader 가 있으면 된다.
- kit 은 `import.meta.glob` 같은 번들러 전용 기능을 쓰지 않는다.

## 7. 녹화 모드(시연 영상용)

`npm run dev` 로 띄운 뒤 `http://localhost:5174/?record=S5` 를 열면 1920×1080 무대만 컨트롤 · 커서 없이 loop 재생한다.

| 매개변수 | 값                             | 뜻                                                                                                                            |
| -------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `record` | `S1` ~ `S6`                    | 녹화할 시나리오                                                                                                               |
| `speed`  | `0.25` ~ `4`(기본 `1`)         | 재생 속도                                                                                                                     |
| `bg`     | `screen`(기본) · `transparent` | transparent 면 무대 바탕 없이 페이지를 크로마키 초록(#00FF00)으로 칠한다. 화면 녹화는 투명을 담지 못하니 편집에서 초록을 뺀다 |

- 무대는 창 크기에 맞춘다(contain). **창이 1920×1080 이면 정확히 1920×1080** 이다.
    - OBS: "브라우저 소스"를 추가하고 URL 에 위 주소, 너비 1920 · 높이 1080 을 넣는다. 창 크기 · 화면 배율과 상관없이 1920×1080 으로 나온다(권장).
    - 화면 녹화 도구: 1920×1080 화면에서 Windows 디스플레이 배율을 100% 로 두고 브라우저 F11(전체 화면)로 연다. 배율이 125% 면 창이 1536×864 가 되어 그 크기로 줄어든다.
- 반복 사이 쉼은 없다. 끝 크로스페이드(0.4초)가 처음과 이어 주므로, 편집에서는 5장 표의 "한 바퀴" 길이대로 자르면 된다.

### 발표 모드

`http://localhost:5174/?show` 를 열면 S1 → S6 을 PPT 처럼 넘기며 본다. 화면은 녹화 모드와 같다(무대만, 컨트롤 · 커서 없이, 창에 맞춰 contain). `?show=S2,S3,S5` 처럼 적으면 그 순서대로만 보인다.

- 시나리오에 들어오면 비트를 처음부터 끝까지 이어 재생하고 마지막 비트 끝 상태에서 멈춘다.
- → · Space · 클릭은 다음 시나리오, ← 는 이전 시나리오(처음부터), R 은 지금 시나리오 다시 재생이다. 넘길 때 0.4초 크로스페이드로 바뀐다. 양 끝에서는 넘어가지 않는다.
- 넘김 대기를 빼면 S1 ~ S6 한 바퀴는 1배속으로 61.8초다(시나리오마다 5장 표의 "한 바퀴"에서 끝 크로스페이드 0.4초를 뺀 길이).

### 임베드 플레이어(발표 슬라이드용)

`npm run embed` 는 `embed.html`(진입 `src/app/embed-main.tsx`)을 HTML 한 파일로 빌드해 `../presentation/rmd-player.html` 에 쓴다. 발표 슬라이드(`presentation/index.html`)가 `<iframe src="rmd-player.html#S5">` 로 부른다. kit · scenarios 를 고쳤으면 다시 돌리고 결과를 커밋한다.

- JS · CSS · 사진 · 아이콘은 파일 안에 넣는다(`file://` 로 열어도 돈다). 폰트는 넣지 않고 Google Fonts 링크로 부른다(빌드가 kit.css 의 fonts.css import 를 빼고 서체 토큰을 덮는다. kit 은 고치지 않는다).
- 해시(`#S1` ~ `#S6`)로 시나리오를 고른다. 바탕은 투명이고 무대는 iframe 안에 16:9 contain 으로 그린다.
- 부모와는 postMessage 로 말한다. 준비되면 부모에 `rmd:ready` 를 보내고 첫 화면에 멈춰 있는다. `rmd:play` 를 받으면 처음부터 loop 재생하고, `rmd:stop` 을 받으면 첫 화면으로 돌아가 멈춘다.
- 개발할 때는 `http://localhost:5174/embed.html#S5` 를 바로 연다(부모가 없으면 곧바로 재생한다. 폰트는 kit 것을 쓴다).

## 8. 고지

- 사진: `kit/assets/photos/credits.json` (picsum = Unsplash, 사진마다 작가 · 원본 주소). 처음 11장은 landing 에서 복사했고 4장(490 · 444 · 478 · 326)은 `npm run photos` 로 받았다.
- 폰트: `kit/fonts/OFL-noto-sans-kr.txt` · `kit/fonts/OFL-gowun-dodum.txt` (SIL Open Font License 1.1).
- 아이콘: `kit/ui/Icon.tsx` 머리 주석 (Lucide, ISC License). lucide-react 대신 SVG 요소를 옮겨 적었다.

## 9. 시나리오 추가하기

1. `scenarios/sN/Screen.tsx` 에 화면 상태(`View`)와 그리기(`Screen`), `scenarios/sN/index.ts` 에 `defineScenario<View>({ … })` 를 둔다. 기존 장면은 `scenarios/screens/` 에 있다(기억 탭 · 지도 · 알림창 · 08 · 저장 결과 · 추천 등).
2. `beats`: `{ id, label, caption, start, end }`. 비트 하나는 2 ~ 4초, 전체 8 ~ 18초. **비트 끝 0.5초 전에는 동작 · 손가락 · 카메라를 마친다**(step 에서 멈춘 화면이 정돈되게).
3. `segments`: `{ at, xfade, view(t) }`. 시각에서 화면 상태를 정하는 순수 함수다. view 안에는 숫자 · 문자열 · 불리언만 둔다(엔진이 숫자를 0.02 단위로 끊어 다시 그릴지 정한다. Date 는 넣지 않는다). 진행 값은 `progress(t, start, duration, ease?)` 를 쓴다.
4. `duration`: 마지막 비트 끝 + 0.4(처음으로 돌아가는 크로스페이드는 엔진이 만든다).
5. `motion`: 탭 `{ target, move, at }`(대상은 장면 안 `data-rmd-target`), 끌기 `drags`, 손가락이 보이는 구간 `pointer`, 폰 몸체 카메라 `camera(t)`.
6. 무대 옆 설명이 필요하면 `aside: { view(t), Component }`(S3 · S6 처럼 `screens/StepsAside` 를 쓰면 된다).
7. 문구 · 수치는 앱 레포(develop)의 규칙을 따른다(조사, 시간 표기 `savedAgo`, 바램 `fadeFor`, 섹션 `toAlbumSections`, 알림 본문 `nearbyBody` 등은 `screens/album.ts` · `screens/saveResult.ts` 에 옮겨 두었다). 앱에 없는 화면이면 `concept: true` 로 둔다. 실제 브랜드 로고는 그리지 않고, 강조색(자두색)은 화면당 주 버튼 하나다.
8. `scenarios/index.ts` 의 `SCENARIOS` 에 넣고, `npm run shots` 로 비트별 끝 상태 · step 재생을 확인한 뒤 이 문서 5장 표를 고친다(`npm run check:readme` 가 자막 · 길이가 빠지면 알려 준다).

## 10. 알려진 차이

- `landing/src/demo` 와 코드가 중복된다. 이 폴더는 landing 데모를 복사해 시작했고, 공유 패키지를 두지 않았다(landing 은 Cloudflare Pages 가 `landing/` 을 루트로 빌드한다). 한쪽만 고치면 서로 어긋날 수 있다.
- landing 의 08 은 원래 색으로 풀릴 때 핀과 썸네일이 함께 풀리고 easing 이 cubic 이다. 앱(그리고 이 데모)은 핀이 처음부터 원래 색이고 썸네일만 600ms inOut quad 로 풀린다.
- `npm run shots` 결과를 바이트로 비교하면 SVG 아이콘 가장자리 몇 픽셀(최대 3/255 정도)이 렌더링마다 흔들릴 수 있다. 비교는 픽셀 차이 개수로 본다.

## 11. 개발 명령

| 명령                                                               | 하는 일                                                                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                                                      | 갤러리(http://localhost:5174). `?s=S5` 로 시나리오 선택, `?s=S5&t=3.2` · `?s=S5&beat=2`(`&view=phone` · `&bg=transparent`)는 1920×1080 정지 화면 |
| `npm run build` · `typecheck` · `lint` · `format` · `format:check` | 빌드 · 타입 · 린트 · 포맷                                                                                                                        |
| `npm run embed`                                                    | 임베드 플레이어를 HTML 한 파일로 빌드해 `../presentation/rmd-player.html` 에 쓴다(7장)                                                           |
| `npm run check:portable`                                           | kit · scenarios 의 import 와 CSS 선택자 검사                                                                                                     |
| `npm run check:readme`                                             | 이 문서의 사용 예 · 시나리오 표가 코드와 같은지 검사                                                                                             |
| `npm run shots`                                                    | 비트별 끝 상태(무대 · 폰만) · step 재생 · 뒤로 가기 · 맞춤 · 녹화 스크린샷을 `.shots/` 에(설치된 Edge, `SHOTS_BROWSER_CHANNEL=chrome` 로 바꿈)   |
| `npm run photos -- <id…>`                                          | picsum 사진을 받아 `kit/assets/photos` 에 넣고 credits 갱신                                                                                      |
| `npm run fonts`                                                    | fontsource woff2 를 `kit/fonts` 로 복사하고 fonts.css 생성                                                                                       |

갤러리에서는 왼쪽에서 시나리오를 고르고 위 조작 줄에서 step(→ ← 키) · loop, 속도, 무대/폰만, 바탕, 상자(넓게 · 좁고 낮게)를 바꾼다.
