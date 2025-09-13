import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo").setDescription("ดูข้อมูลผู้ใช้")
    .addUserOption(o => o.setName("target").setDescription("เลือกคน")),
  async run(i) {
    const user = i.options.getUser("target") ?? i.user;
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.tag}`)
      .setDescription(`ID: ${user.id}`)
      .setTimestamp(Date.now());
    await i.reply({ embeds: [embed], ephemeral: true });
  }
};
