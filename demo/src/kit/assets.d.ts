// 사진 · 아이콘 import 의 타입. 번들러(Vite · webpack 5 asset 모듈 등)는 이 파일들을 URL 문자열로 준다.
// 가져다 쓰는 쪽이 이미 같은 선언(vite/client 등)을 갖고 있어도 겹치지 않게 모듈 선언만 둔다.
declare module "*.webp" {
    const src: string;
    export default src;
}

declare module "*.png" {
    const src: string;
    export default src;
}

// 스타일 import(kit.css). 번들러가 처리하고 값은 쓰지 않는다.
declare module "*.css";
