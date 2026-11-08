// 앱 아이콘(src/assets/icon/app-icon.png, 앱 레포 frontend/assets/images/icon.png 를 192 로 줄인 것)으로 사이트 아이콘을 만든다.
// public/favicon.ico(16 · 32 PNG 내장) · public/icon-32.png · public/apple-touch-icon.png(180). npm run icons 로 직접 실행한다.
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SOURCE = fileURLToPath(
    new URL("../src/assets/icon/app-icon.png", import.meta.url),
);
const OUT = new URL("../public/", import.meta.url);

function png(size) {
    return sharp(SOURCE)
        .resize(size, size, { kernel: "lanczos3" })
        .png({ compressionLevel: 9 })
        .toBuffer();
}

// ICO 는 PNG 를 그대로 담을 수 있다: 머리 6바이트 + 항목마다 16바이트 + PNG 데이터.
function ico(images) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);
    let offset = 6 + 16 * images.length;
    const entries = images.map(({ size, data }) => {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0);
        entry.writeUInt8(size >= 256 ? 0 : size, 1);
        entry.writeUInt8(0, 2);
        entry.writeUInt8(0, 3);
        entry.writeUInt16LE(1, 4);
        entry.writeUInt16LE(32, 6);
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        offset += data.length;
        return entry;
    });
    return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

await mkdir(OUT, { recursive: true });
const [png16, png32, png180] = await Promise.all([png(16), png(32), png(180)]);
await writeFile(new URL("icon-32.png", OUT), png32);
await writeFile(new URL("apple-touch-icon.png", OUT), png180);
await writeFile(
    new URL("favicon.ico", OUT),
    ico([
        { size: 16, data: png16 },
        { size: 32, data: png32 },
    ]),
);
console.log("public/favicon.ico · icon-32.png · apple-touch-icon.png");
