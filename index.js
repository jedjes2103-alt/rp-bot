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
