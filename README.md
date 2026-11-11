# remembrall-landing
카카오테크캠퍼스 충남대 3팀 프로젝트 소개 페이지

## 배포 주소

| 주소 | 내용 |
| --- | --- |
| https://remembrall-landing.pages.dev | 랜딩 (`landing/`, Cloudflare Pages) |
| https://hraverals.github.io/remembrall-landing/presentation/ | 발표 자료 (`presentation/index.html`) |
| https://hraverals.github.io/remembrall-landing/demo/ | 시나리오 데모 (`demo/`). 갤러리, `?show` 발표 모드, `?record=S5` 녹화 모드 |
| https://hraverals.github.io/remembrall-landing/ | 랜딩으로 넘기는 리다이렉트 페이지 |

GitHub Pages 쪽은 `.github/workflows/pages.yml` 이 배포한다. main 에 `demo/` · `presentation/` 변경이 푸시되면 돌고, Actions 탭에서 수동으로도 돌릴 수 있다.

- 저장소 Settings → Pages → Source 를 **GitHub Actions** 로 둔다(브랜치 배포가 아니다).
- presentation 은 워크플로에서 다시 만들지 않는다. 커밋된 `index.html` · `rmd-player.html` 과 `index.html` 이 부르는 `deck/assets` 파일만 올라간다.
