import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Events
} from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ---------- Define slash commands ----------
const slashDefs = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("เช็กความหน่วง (pong!)"),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("ดูคำสั่งพื้นฐานของบอทนี้")
].map(c => c.toJSON());

// ----- เพิ่มเข้าไปข้างล่าง ping/help -----
import { PermissionsBitField } from "discord.js";

const slashDefs = [
  new SlashCommandBuilder().setName("ping").setDescription("เช็กความหน่วง"),
  new SlashCommandBuilder().setName("help").setDescription("ดูคำสั่งพื้นฐาน"),
  // admin: ประกาศข้อความทั้งห้อง
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("ประกาศข้อความ (แอดมินหรือยศที่กำหนดเท่านั้น)")
    .addStringOption(o => o.setName("message").setDescription("ข้อความ").setRequired(true)),
  // ทอยลูกเต๋า
  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("ทอยลูกเต๋า เช่น 1d20, 2d6")
    .addStringOption(o => o.setName("dice").setDescription("รูปแบบลูกเต๋า").setRequired(true)),
  // ข้อมูลผู้ใช้
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("ดูข้อมูลผู้ใช้")
    .addUserOption(o => o.setName("target").setDescription("เลือกคน").setRequired(false)),
].map(c => c.toJSON());

function hasAllowedRole(member) {
  const adminRoleId = process.env.ADMIN_ROLE_ID;   // ตั้งใน Render
  const modRoleId   = process.env.MOD_ROLE_ID;     // ตั้งใน Render (ถ้ามี)
  if (!member || !member.roles) return false;
  const roles = member.roles.cache;
  return (
    roles.has(adminRoleId ?? "") ||
    roles.has(modRoleId ?? "") ||
    member.permissions.has(PermissionsBitField.Flags.Administrator)
  );
}

client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand()) return;
  try {
    if (i.commandName === "ping") {
      const sent = await i.reply({ content: "Pong! 🏓", fetchReply: true });
      const ms = sent.createdTimestamp - i.createdTimestamp;
      await i.editReply(`Pong! 🏓 \`${ms}ms\``);
    } else if (i.commandName === "help") {
      await i.reply({
        content:
          "คำสั่งตอนนี้:\n• `/ping`\n• `/help`\n• `/roll 1d20`\n• `/userinfo`\n• `/announce` (เฉพาะแอดมิน/ยศที่กำหนด)",
        ephemeral: true
      });
    } else if (i.commandName === "announce") {
      if (!hasAllowedRole(i.member)) {
        return i.reply({ content: "คุณไม่มีสิทธิ์ใช้คำสั่งนี้", ephemeral: true });
      }
      const msg = i.options.getString("message", true);
      await i.channel.send(`📣 **ประกาศ:** ${msg}`);
      await i.reply({ content: "ส่งประกาศแล้ว!", ephemeral: true });
    } else if (i.commandName === "roll") {
      const spec = i.options.getString("dice", true).trim();
      const m = spec.match(/^(\d+)d(\d+)$/i);
      if (!m) return i.reply({ content: "รูปแบบไม่ถูกต้อง ใช้เช่น `1d20`, `2d6`", ephemeral: true });
      const n = Math.min(parseInt(m[1],10), 50); // กันสแปม
      const sides = Math.min(parseInt(m[2],10), 1000);
      const rolls = Array.from({length: n}, () => 1 + Math.floor(Math.random()*sides));
      const sum = rolls.reduce((a,b)=>a+b,0);
      await i.reply(`🎲 \`${spec}\` → [${rolls.join(", ")}] = **${sum}**`);
    } else if (i.commandName === "userinfo") {
      const user = i.options.getUser("target") ?? i.user;
      await i.reply({ content: `👤 ${user.tag} (ID: ${user.id})`, ephemeral: true });
    }
  } catch (e) {
    console.error(e);
    if (i.deferred || i.replied) {
      await i.followUp({ content: "❌ มีข้อผิดพลาด", ephemeral: true });
    } else {
      await i.reply({ content: "❌ มีข้อผิดพลาด", ephemeral: true });
    }
  }
});


// ---------- Register commands on startup (guild-scoped: เร็ว) ----------
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  const appId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!appId || !guildId) {
    console.warn("⚠️ Missing CLIENT_ID or GUILD_ID; skip slash registration.");
    return;
  }

  await rest.put(Routes.applicationGuildCommands(appId, guildId), {
    body: slashDefs
  });
  console.log("✅ Slash commands registered to guild:", guildId);
}

// ---------- Bot events ----------
client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  try {
    await registerCommands();
  } catch (e) {
    console.error("❌ Register commands failed:", e);
  }
});

client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand()) return;

  try {
    if (i.commandName === "ping") {
      const sent = await i.reply({ content: "Pong! 🏓", fetchReply: true });
      const ms = sent.createdTimestamp - i.createdTimestamp;
      await i.editReply(`Pong! 🏓 \`${ms}ms\``);
    } else if (i.commandName === "help") {
      await i.reply({
        content:
          "คำสั่งที่มีตอนนี้:\n• `/ping` — เช็กความหน่วง\n• `/help` — ดูรายการคำสั่ง",
        ephemeral: true
      });
    }
  } catch (e) {
    console.error(e);
    if (i.deferred || i.replied) {
      await i.followUp({ content: "❌ มีข้อผิดพลาด", ephemeral: true });
    } else {
      await i.reply({ content: "❌ มีข้อผิดพลาด", ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
