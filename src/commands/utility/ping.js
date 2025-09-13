import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("เช็กความหน่วง"),
  cooldownSec: 3,
  async run(i) {
    const sent = await i.reply({ content: "Pong! 🏓", fetchReply: true });
    const ms = sent.createdTimestamp - i.createdTimestamp;
    await i.editReply(`Pong! 🏓 \`${ms}ms\``);
  }
};
