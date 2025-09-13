import "dotenv/config";
import {
  Client, GatewayIntentBits, Partials,
  REST, Routes, Events, Collection
} from "discord.js";
import { loadAllCommands } from "./src/loader.js";
import { createCooldown } from "./src/utils/cooldown.js";
import { sendLog } from "./src/utils/logger.js";

const cfg = {
  token: process.env.DISCORD_TOKEN,
  appId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  adminRoleId: process.env.ADMIN_ROLE_ID || "",
  modRoleId: process.env.MOD_ROLE_ID || "",
  logChannelId: process.env.LOG_CHANNEL_ID || ""
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});

const cooldown = createCooldown();          // /utils/cooldown.js
let commands = new Collection();            // ชุดคำสั่งที่โหลด

async function registerSlashForGuild(list) {
  if (!cfg.appId || !cfg.guildId) {
    console.warn("⚠️ Missing CLIENT_ID or GUILD_ID; skip slash registration.");
    return;
  }
  const rest = new REST({ version: "10" }).setToken(cfg.token);
  await rest.put(Routes.applicationGuildCommands(cfg.appId, cfg.guildId), { body: list });
  console.log("✅ Slash commands registered to guild:", cfg.guildId);
}

async function reloadAll() {
  const { commandMap, slashArray } = await loadAllCommands({
    adminRoleId: cfg.adminRoleId,
    modRoleId: cfg.modRoleId
  });
  commands = commandMap;
  await registerSlashForGuild(slashArray);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  await reloadAll();
  if (cfg.logChannelId) {
    await sendLog(client, cfg.logChannelId, `✅ **Bot started** as **${c.user.tag}**`);
  }
});

client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand()) return;
  const cmd = commands.get(i.commandName);
  if (!cmd) return;

  // ตรวจ cooldown
  if (cmd.cooldownSec && !cooldown.canRun(i.user.id, i.commandName, cmd.cooldownSec)) {
    const wait = cooldown.remaining(i.user.id, i.commandName);
    return i.reply({ content: `⏳ รออีก ${wait}s ก่อนใช้ \`/${i.commandName}\``, ephemeral: true });
    }

  try {
    await cmd.run(i, {
      cfg,
      client,
      cooldown,
      sendLog: (msg) => cfg.logChannelId && sendLog(client, cfg.logChannelId, msg)
    });
  } catch (e) {
    console.error(e);
    if (i.deferred || i.replied) {
      await i.followUp({ content: "❌ มีข้อผิดพลาด", ephemeral: true });
    } else {
      await i.reply({ content: "❌ มีข้อผิดพลาด", ephemeral: true });
    }
  }
});

client.login(cfg.token);
