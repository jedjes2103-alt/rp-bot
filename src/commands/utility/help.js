import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("help").setDescription("ดูคำสั่งพื้นฐาน"),
  async run(i) {
    await i.reply({
      content: "คำสั่ง:\n• `/ping`\n• `/help`\n• `/userinfo [user]`\n• `/roll 1d20`\n• `/emote <ข้อความ>`\n• `/announce <ข้อความ>` (เฉพาะยศ/แอดมิน)\n• `/reload` (แอดมิน)",
      ephemeral: true
    });
  }
};
