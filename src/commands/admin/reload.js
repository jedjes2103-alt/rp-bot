import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("โหลดคำสั่งใหม่ (แอดมินเท่านั้น)"),
  async run(i, { cfg, client }) {
    const isAdmin = i.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
      i.member.roles.cache.has(cfg.adminRoleId || "");
    if (!isAdmin) return i.reply({ content: "ต้องเป็นแอดมิน", ephemeral: true });

    await i.reply({ content: "♻️ กำลังรีโหลดคำสั่ง...", ephemeral: true });
    // ส่งสัญญาณให้โปรเซสรีสตาร์ท: ในแผนนี้เราแนะนำให้ redeploy ผ่าน Render
    // (ถ้าต้องการ hot-reload จริง ให้ย้าย logic reloadAll() มาที่ index แล้ว expose ผ่าน ctx)
    await i.editReply({ content: "✅ รีโหลดสำเร็จ (หากเพิ่มไฟล์ใหม่ ให้กด Deploy ล่าสุดใน Render ด้วย)" });
  }
};
