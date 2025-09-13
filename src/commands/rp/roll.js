import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("roll").setDescription("ทอยลูกเต๋า เช่น 1d20, 2d6")
    .addStringOption(o => o.setName("dice").setDescription("รูปแบบลูกเต๋า").setRequired(true)),
  cooldownSec: 2,
  async run(i) {
    const spec = i.options.getString("dice", true).trim();
    const m = spec.match(/^(\d+)d(\d+)$/i);
    if (!m) return i.reply({ content: "ใช้รูปแบบเช่น `1d20`, `2d6`", ephemeral: true });
    const n = Math.min(parseInt(m[1],10), 50);
    const sides = Math.min(parseInt(m[2],10), 1000);
    const rolls = Array.from({length:n}, ()=> 1 + Math.floor(Math.random()*sides));
    const sum = rolls.reduce((a,b)=>a+b,0);
    await i.reply(`🎲 \`${spec}\` → [${rolls.join(", ")}] = **${sum}**`);
  }
};
