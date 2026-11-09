// 문서 페이지(/tech-spec 등). content/<name>.md 를 빌드 때 HTML 로 바꿔 <name>.html 의 자리에 넣는다.
// 문서 페이지에는 JS 가 없다. marked 는 여기(Node)에서만 돌고 브라우저로 가지 않는다.
//
// md 규칙
// - "## 제목 {#id}": 목차 항목이 된다. ## 에는 {#id} 가 꼭 있어야 한다(없으면 빌드 실패). ### 의 {#id} 는 선택.
// - 링크 주소 "repo:경로": 팀 레포 develop 의 GitHub 주소로 바뀐다. 경로의 한글 · 공백은 여기서 인코딩한다.
//   공백이 든 경로는 [이름](<repo:backend/저장 파이프라인.md>) 처럼 <> 로 감싼다(마크다운 문법).
// - 표는 가로 스크롤 감싸개(.doc-table) 안에 들어간다.
// - <!-- 메모 --> 는 빌드 결과에서 빠진다.
import fs from "node:fs";
import path from "node:path";

import { Marked, type Tokens } from "marked";
import type { Plugin } from "vite";

export type DocPage = { name: string };

const TOC_SLOT = "<!--doc:toc-->";
const BODY_SLOT = "<!--doc:body-->";
const HEADING_ID = /\s*\{#([a-z0-9-]+)\}\s*$/;
const REPO_PREFIX = "repo:";

type HeadingWithId = Tokens.Heading & { id?: string };

export function renderDoc(
    markdown: string,
    repoBase: string,
): { toc: string; body: string } {
    const tocItems: string[] = [];
    const marked = new Marked({
        walkTokens(token) {
            if (token.type === "link") {
                const link = token as Tokens.Link;
                if (link.href.startsWith(REPO_PREFIX)) {
                    link.href =
                        repoBase +
                        encodeURI(link.href.slice(REPO_PREFIX.length));
                }
            }
            if (token.type === "heading") {
                const heading = token as HeadingWithId;
                const match = HEADING_ID.exec(heading.text);
                const last = heading.tokens.at(-1);
                if (match != null && last?.type === "text") {
                    heading.id = match[1];
                    heading.text = heading.text.replace(HEADING_ID, "");
                    const text = last as Tokens.Text;
                    text.text = text.text.replace(HEADING_ID, "");
                    text.raw = text.raw.replace(HEADING_ID, "");
                } else if (heading.depth === 2) {
                    throw new Error(
                        `## 제목에 {#id} 가 없다: "${heading.text}"`,
                    );
                }
            }
        },
        renderer: {
            heading(token) {
                const { id } = token as HeadingWithId;
                const inner = this.parser.parseInline(token.tokens);
                if (token.depth === 2 && id != null) {
                    tocItems.push(`<li><a href="#${id}">${inner}</a></li>`);
                }
                const idAttr = id == null ? "" : ` id="${id}"`;
                return `<h${token.depth}${idAttr}>${inner}</h${token.depth}>\n`;
            },
        },
    });

    // md 안의 <!-- 메모 --> 는 쓰는 사람용이라 페이지 소스에 내보내지 않는다.
    const source = markdown.replace(/<!--[\s\S]*?-->/g, "");
    const body = (marked.parse(source, { async: false }) as string)
        .replaceAll("<table>", '<div class="doc-table"><table>')
        .replaceAll("</table>", "</table></div>");
    const toc = `<ol class="doc-toc__list">${tocItems.join("")}</ol>`;
    return { toc, body };
}

export function docPages(pages: readonly DocPage[], repoBase: string): Plugin {
    let root = process.cwd();
    const markdownPath = (name: string) =>
        path.resolve(root, "content", `${name}.md`);

    return {
        name: "doc-pages",
        configResolved(config) {
            root = config.root;
        },
        configureServer(server) {
            // md 를 고치면 dev 서버가 페이지를 다시 불러온다.
            for (const page of pages)
                server.watcher.add(markdownPath(page.name));
            server.watcher.on("change", (file) => {
                const changed = path.resolve(file);
                if (pages.some((page) => markdownPath(page.name) === changed)) {
                    server.ws.send({ type: "full-reload" });
                }
            });
        },
        transformIndexHtml: {
            order: "pre",
            handler(html, ctx) {
                const page = pages.find(
                    (candidate) => ctx.path === `/${candidate.name}.html`,
                );
                if (page == null) return html;
                if (!html.includes(TOC_SLOT) || !html.includes(BODY_SLOT)) {
                    throw new Error(
                        `${page.name}.html 에 ${TOC_SLOT} · ${BODY_SLOT} 자리가 없다`,
                    );
                }
                const markdown = fs.readFileSync(
                    markdownPath(page.name),
                    "utf8",
                );
                const { toc, body } = renderDoc(markdown, repoBase);
                // 함수로 넘겨 본문의 "$&" 같은 글자가 치환 패턴으로 읽히지 않게 한다.
                return html
                    .replace(TOC_SLOT, () => toc)
                    .replace(BODY_SLOT, () => body);
            },
        },
    };
}
