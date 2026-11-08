// 앱 목 데이터의 picsum 사진을 9:16 으로 받아 webp 로 줄이고, 작가 정보를 credits.json 에 남긴다.
// 런타임에 picsum 을 부르지 않으려고 결과물을 레포에 넣는다. 빌드 때는 돌지 않는다(npm run photos 로 직접 실행).
// lg 720×1280: Shorts 화면 · 배경 카드. sm 270×480: 썸네일 · 기억 탭 셀 · 지도 핀.
// picsum 사진은 Unsplash 사진이다. 크레딧은 푸터에서 쓴다.
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// id → 앱 목 데이터의 장소 이름. 이름이 없는 사진은 배경용이다.
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
];

const SIZES = [
    { suffix: "", width: 720, height: 1280 },
    { suffix: "-sm", width: 270, height: 480 },
];
const QUALITY = 72;
const OUT = new URL("../src/assets/photos/", import.meta.url);

async function get(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} → ${response.status}`);
    return response;
}

await mkdir(OUT, { recursive: true });
const credits = [];
for (const [id, place] of PHOTOS) {
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
    credits.push({ id, place, author: info.author, source: info.url });
    console.log(`${id} ${place ?? "-"} · ${info.author}`);
}
await writeFile(
    new URL("credits.json", OUT),
    JSON.stringify(credits, null, 4) + "\n",
);
