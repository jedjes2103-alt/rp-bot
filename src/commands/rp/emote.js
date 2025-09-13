import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("emote").setDescription("ส่งอีโมต/แอคชันในห้อง")
    .addStringOption(o => o.setName("text").setDescription("ข้อความแอคชัน").setRequired(true)),
  cooldownSec: 2,
  async run(i) {
    const text = i.options.getString("text", true);
    await i.reply({ content: `*${i.user.username}* ${text}` });
  }
};
