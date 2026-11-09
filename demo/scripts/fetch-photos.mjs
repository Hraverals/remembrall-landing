// picsum 사진을 9:16 으로 받아 webp 로 줄이고, 작가 정보를 credits.json 에 남긴다. landing scripts/fetch-photos.mjs 를 옮긴 것이다.
// 런타임에 picsum 을 부르지 않으려고 결과물을 레포에 넣는다(src/kit/assets/photos). 빌드 때는 돌지 않는다.
// lg 720×1280: Shorts 화면 · 배경 카드. sm 270×480: 썸네일 · 기억 탭 셀 · 지도 핀. picsum 사진은 Unsplash 사진이다.
// 처음 11장은 landing 에서 복사했다. 새 사진만 받으려면 id 를 준다: npm run photos -- 444 478
// 고를 때: 사람 얼굴 · 실제 상호 간판 · 상표가 크게 보이는 사진은 쓰지 않는다(지어낸 가게 이름과 어긋나지 않게).
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// id → 데모에서 쓰는 곳. 이름이 없는 사진은 배경 · 원본 영상용이다.
const PHOTOS = [
    [1080, "성심당 본점"],
    [488, "대흥동 성당"],
    [1060, "오후 네시"],
    [674, "으능정이 스카이로드"],
    [292, "한밭 손칼국수"],
    [1031, "옛 충남도청"],
    [1036, "대전 중앙시장"],
    [312, "소제동 카페거리"],
    [1015, "계족산 황톳길"],
    [431, null],
    [225, null],
    // S6 추천(14) 카드. 지어낸 가게 이름이다.
    [490, "모퉁이 칼국수"],
    [444, "골목 끝 서점"],
    [478, "철길 옆 정원"],
    [326, "소제 국밥"],
];

const SIZES = [
    { suffix: "", width: 720, height: 1280 },
    { suffix: "-sm", width: 270, height: 480 },
];
const QUALITY = 72;
const OUT = new URL("../src/kit/assets/photos/", import.meta.url);
const CREDITS = new URL("credits.json", OUT);

async function get(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} → ${response.status}`);
    return response;
}

const only = process.argv.slice(2).map(Number);
const targets = PHOTOS.filter(([id]) => only.length === 0 || only.includes(id));
const credits = JSON.parse(await readFile(CREDITS, "utf8"));

for (const [id, place] of targets) {
    // 큰 크기로 한 번 받아(picsum 이 가운데를 9:16 으로 자른다) 두 크기로 줄인다.
    const source = Buffer.from(
        await (
            await get(`https://picsum.photos/id/${id}/720/1280`)
        ).arrayBuffer(),
    );
    for (const { suffix, width, height } of SIZES) {
        await sharp(source)
            .resize(width, height, { fit: "cover" })
            .webp({ quality: QUALITY })
            .toFile(fileURLToPath(new URL(`${id}${suffix}.webp`, OUT)));
    }
    const info = await (
        await get(`https://picsum.photos/id/${id}/info`)
    ).json();
    const entry = { id, place, author: info.author, source: info.url };
    const index = credits.findIndex((credit) => credit.id === id);
    if (index === -1) credits.push(entry);
    else credits[index] = entry;
    console.log(`${id} ${place ?? "-"} · ${info.author}`);
}

// PHOTOS 순서로 맞춘다.
const order = PHOTOS.map(([id]) => id);
credits.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
await writeFile(CREDITS, JSON.stringify(credits, null, 4) + "\n");
