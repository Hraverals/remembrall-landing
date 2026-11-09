// fontsource 패키지(개발 의존성)의 woff2 를 src/kit/fonts/files 로 복사하고 src/kit/fonts/fonts.css 를 만든다.
// kit 을 폴더째 복사하면 폰트도 따라가게 하려는 것이다. landing 처럼 unicode-range 로 나눈 조각을 그대로 써서 브라우저는 필요한 조각만 받는다.
// 한글 조각(번호)과 latin · latin-ext 만 옮긴다(cyrillic · vietnamese 는 쓰지 않는다).
// 패밀리 이름 앞에 "RMD " 를 붙여 가져다 쓰는 쪽(발표 자료)의 같은 이름 폰트와 섞이지 않게 한다.
// 폰트 버전을 올릴 때만 npm run fonts 로 다시 돌린다. 결과물은 커밋한다.
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = `${ROOT}src/kit/fonts`;
const KEEP = /-(\d+|latin|latin-ext)-\d00-normal$/;

const SOURCES = [
    { pkg: "noto-sans-kr", family: "Noto Sans KR", weights: [400, 500] },
    { pkg: "gowun-dodum", family: "Gowun Dodum", weights: [400] },
];

await rm(`${OUT}/files`, { recursive: true, force: true });
await mkdir(`${OUT}/files`, { recursive: true });

const blocks = [];
let count = 0;
for (const { pkg, family, weights } of SOURCES) {
    const dir = `${ROOT}node_modules/@fontsource/${pkg}`;
    await copyFile(`${dir}/LICENSE`, `${OUT}/OFL-${pkg}.txt`);
    for (const weight of weights) {
        const css = await readFile(`${dir}/${weight}.css`, "utf8");
        for (const match of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
            const body = match[1] ?? "";
            const file = /url\(\.\/files\/([^)]+)\.woff2\)/.exec(body)?.[1];
            const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1];
            if (file == null || range == null || !KEEP.test(file)) continue;
            await copyFile(
                `${dir}/files/${file}.woff2`,
                `${OUT}/files/${file}.woff2`,
            );
            count += 1;
            blocks.push(
                [
                    "@font-face {",
                    `    font-family: "RMD ${family}";`,
                    "    font-style: normal;",
                    "    font-display: swap;",
                    `    font-weight: ${weight};`,
                    `    src: url("./files/${file}.woff2") format("woff2");`,
                    `    unicode-range: ${range.trim()};`,
                    "}",
                ].join("\n"),
            );
        }
    }
}

await writeFile(
    `${OUT}/fonts.css`,
    [
        "/* scripts/copy-fonts.mjs 가 만든다. 손으로 고치지 않는다. Noto Sans KR · Gowun Dodum, SIL OFL 1.1(OFL-*.txt). */",
        ...blocks,
        "",
    ].join("\n\n"),
);
console.log(`woff2 ${count}개 → src/kit/fonts`);
