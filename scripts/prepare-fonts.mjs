import { rm } from "node:fs/promises";
import { join } from "node:path";

// Remove legacy personal-use trial font outputs. Yemen Study now uses the
// IBM Plex type family from its published webfont stylesheet instead.
const outputDirectory = join(process.cwd(), "public", "fonts");
await rm(outputDirectory, { recursive: true, force: true });
process.stdout.write("Legacy trial font files excluded from the build.\n");
