# 발표자료 — REMEMBRALL

- **HTML**: `index.html`을 브라우저로 열기. ←/→ 넘기기, N 대본, F 전체화면
- **claude.ai 덱**: https://claude.ai/artifact/JbzHePMX3Trj193Ptj1g8N (공유받은 계정만)

## 수정

- 원본은 `deck/`. 고친 뒤 claude.ai 덱에 publish (`root` = `presentation/deck`)
- `index.html`은 직접 고치지 말고 `python3 presentation/build/build.py`로 생성
  - Windows에서는 `PYTHONUTF8=1 python presentation/build/build.py` (기본 인코딩이 cp949라 한글이 깨짐)

## 시나리오 애니메이션 슬라이드

- `prob-lost` · `scr-share` · `scr-nearby` · `scr-fade` · `tech-find` · `bm-flow` 6장은 `rmd-player.html#S1` ~ `#S6`을 iframe으로 불러 그 장에 들어오면 처음부터 반복 재생 (나가면 멈춤)
- `rmd-player.html`은 demo 시나리오를 한 파일로 빌드한 결과. 직접 고치지 말고 `cd demo && npm install && npm run embed`로 다시 생성 (demo/README 7장)
- `index.html`과 `rmd-player.html`은 같은 폴더에 둘 것. 폰트는 Google Fonts라 네트워크 필요
- claude.ai 덱에서는 이 6장의 애니메이션 칸이 빈 칸으로 보임 (`rmd-player.html`을 부를 수 없음). 발표는 `index.html`로
