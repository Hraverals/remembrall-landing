# REMEMBRALL 랜딩 페이지 배포

REMEMBRALL 앱 소개 페이지(Vite + React 정적 사이트)를 Cloudflare Pages 에 올리고, APK 를 GitHub Releases 로 내려받게 하는 방법을 정리한다.

## Cloudflare Pages 설정

대시보드에 아래 값을 그대로 넣는다.

| 위치                                                    | 항목                      | 값                                |
| ------------------------------------------------------- | ------------------------- | --------------------------------- |
| Create project → Connect to Git                         | 저장소                    | `Hraverals/remembrall-landing`    |
| Set up builds                                           | Production branch         | `main`                            |
|                                                         | Framework preset          | `None`                            |
|                                                         | Build command             | `npm run build`                   |
|                                                         | Build output directory    | `dist`                            |
|                                                         | Root directory (Advanced) | `landing`                         |
| Settings → Builds → Build watch paths                   | Include paths             | `landing/*`                       |
| Settings → Variables and Secrets (Production · Preview) | `NODE_VERSION`            | `22`                              |
| Settings → Variables and Secrets (Production 만)        | `VITE_SITE_URL`           | `https://<배정된 주소>.pages.dev` |

- Build watch paths 를 `landing/*` 로 두면 `presentation/` 같은 다른 폴더만 바뀐 커밋에서는 다시 빌드하지 않는다.
- `NODE_VERSION`: `landing/.node-version` 에도 22 가 있지만, Root directory 를 `landing` 으로 둘 때 Pages 가 그 파일을 읽는지 문서에 나와 있지 않아 환경 변수로도 정한다. Vite 8 은 Node 20.19+ 또는 22.12+ 가 필요하다.
- `VITE_SITE_URL`: 있으면 빌드가 `og:url` 을 넣고 `og:image` · `twitter:image` 를 절대 주소로 바꾼다(`vite.config.ts`). 끝의 `/` 는 있어도 된다. Preview 배포에는 넣지 않는다(공유용이 아니고, 이때 og:image 는 상대 주소로 남는다).

### 처음 배포하는 순서

1. 위 표대로 프로젝트를 만들고 첫 배포를 한다. 이때는 `VITE_SITE_URL` 없이 한다.
2. 배정된 `*.pages.dev` 주소를 확인한다. 프로젝트 이름이 이미 쓰이고 있으면 뒤에 글자가 붙을 수 있다.
3. Production 환경 변수에 `VITE_SITE_URL` 을 넣고 Deployments 에서 **Retry deployment** 를 누른다. 환경 변수는 다시 빌드해야 반영된다.

### 응답 헤더

`public/_headers` 가 빌드 결과(`dist/_headers`)로 복사된다.

| 경로                                                               | Cache-Control                         |
| ------------------------------------------------------------------ | ------------------------------------- |
| `/assets/*` (해시가 붙은 JS · CSS · 사진 · 폰트)                   | `public, max-age=31536000, immutable` |
| `/`, `/index.html`                                                 | `public, max-age=0, must-revalidate`  |
| `/og.png`, `/favicon.ico`, `/icon-32.png`, `/apple-touch-icon.png` | `public, max-age=3600`                |

모든 응답에 `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` 을 붙인다. 한 요청에 여러 규칙이 걸리면 같은 헤더가 쉼표로 이어 붙으므로 `Cache-Control` 규칙끼리는 경로가 겹치지 않게 둔다.

## APK Release 만들기

페이지의 "APK 다운로드" 버튼은 아래 주소로 바로 연결된다.

```
https://github.com/Hraverals/remembrall-landing/releases/latest/download/remembrall.apk
```

- Release 가 없으면 이 주소는 GitHub 404(Page not found)를 보여 준다. **배포해서 알리기 전에 Release 를 먼저 만든다.**
- Release 가 있어도 아래 경우에는 404 다.
    - Draft 나 Pre-release 다(`latest` 는 둘 다 건너뛴다).
    - 첨부 파일 이름이 정확히 `remembrall.apk` 가 아니다(대소문자 구분).

### 웹에서 만들기

1. EAS preview 빌드 APK 를 받아 파일 이름을 `remembrall.apk` 로 바꾼다.
2. 레포 Releases → **Draft a new release**.
3. Tag 에 새 태그(`v1.0.0` 등)를 쓰고 대상은 `main` 으로 둔다.
4. 제목 · 설명을 쓰고, 첨부칸에 `remembrall.apk` 를 올린다.
5. **Set as a pre-release 는 끄고**, Set as the latest release 를 켠 채 **Publish release** 를 누른다.

### gh CLI 로 만들기

```sh
gh release create v1.0.0 ./remembrall.apk --title "REMEMBRALL 1.0.0" --notes "변경 사항"
```

### 새 버전을 낼 때

같은 파일 이름(`remembrall.apk`)으로 새 Release(`v1.0.1` 등)를 만들면 버튼 링크가 자동으로 새 파일을 가리킨다. 안드로이드는 출처를 알 수 없는 앱 설치 확인을, Chrome 은 다운로드 경고를 띄울 수 있다.

## 배포 뒤 확인 목록

1. **페이지**: 히어로 데모가 재생되는지, 섹션 · 푸터 · favicon · 탭 제목을 본다. 실제 안드로이드 Chrome 에서도 한 번 본다.
2. **헤더**
    ```sh
    curl -sI https://<주소>/assets/<js 파일 이름>   # Cache-Control: ... immutable
    curl -sI https://<주소>/                         # max-age=0, must-revalidate
    curl -sI https://<주소>/og.png                   # max-age=3600
    ```
3. **메타**: 페이지 소스에서 `og:url` 과 `og:image` 가 `https://<주소>/...` 절대 주소인지 본다.
4. **APK**: `curl -sIL <APK 주소>` 가 302 를 거쳐 200 으로 끝나는지, 버튼을 눌러 실제로 내려받아지는지 본다.
5. **OG 미리보기**
    - Facebook Sharing Debugger(developers.facebook.com/tools/debug) → **Scrape Again**
    - LinkedIn Post Inspector
    - X 는 카드 검사기가 없어져 글쓰기 창에 붙여 넣어 본다.
    - Slack · Discord 에 붙여 넣어 본다.
6. **카카오톡**: 카카오는 한 번 읽은 미리보기를 캐시에 둔다. **Kakao Developers 공유 디버거**(developers.kakao.com/tool/debugger/sharing, 카카오 계정 로그인 필요)에 주소를 넣고 **캐시 초기화**를 누른 뒤 채팅방에 링크를 보내 확인한다. og.png 나 문구를 바꾼 뒤에도 같은 방법으로 갱신한다.

OG 이미지를 바꿀 때는 `npm run og` 로 `public/og.png` 를 다시 만든다(설치된 Edge 를 쓴다. Chrome 만 있으면 `OG_BROWSER_CHANNEL=chrome npm run og`).
