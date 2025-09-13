import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadAllCommands(context) {
  const baseDir = path.join(__dirname, "commands");
  const categories = ["admin", "utility", "rp"];
  const commandMap = new Map();
  const slashArray = [];

  for (const cat of categories) {
    const dir = path.join(baseDir, cat);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    for (const f of files) {
      const mod = await import(path.join(dir, f));
      const def = mod.default;
      if (!def?.data || !def?.run) continue;
      def.category = cat;
      def.name = def.data.name;
      commandMap.set(def.data.name, def);
      slashArray.push(def.data.toJSON());
    }
  }
  return { commandMap, slashArray };
}
