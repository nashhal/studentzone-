import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

async function readFontParts(folder, count) {
  const parts = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      readFile(join(root, folder, `${String(index + 1).padStart(2, "0")}.b64`), "utf8"),
    ),
  );
  const encoded = parts.join("").replace(/\\s+/g, "");
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new Error(`Invalid base64 font source in ${folder}`);
  }
  return Buffer.from(encoded, "base64");
}

const fonts = [
  {
    source: "font-source/bushra",
    chunks: 6,
    output: "RTL-Bushra-Medium.woff2",
    expectedBytes: 17508,
  },
  {
    source: "font-source/eid",
    chunks: 3,
    output: "EidFontByRola.woff2",
    expectedBytes: 8656,
  },
];

const outputDirectory = join(root, "public", "fonts");
await mkdir(outputDirectory, { recursive: true });

for (const font of fonts) {
  const data = await readFontParts(font.source, font.chunks);
  if (data.subarray(0, 4).toString("ascii") !== "wOF2") {
    throw new Error(`${font.output} is not a valid WOFF2 file`);
  }
  if (data.length !== font.expectedBytes) {
    throw new Error(`${font.output} has unexpected size: ${data.length} bytes`);
  }
  await writeFile(join(outputDirectory, font.output), data);
  process.stdout.write(`Prepared ${font.output} (${data.length} bytes)\\n`);
}
