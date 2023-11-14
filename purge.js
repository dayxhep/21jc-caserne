require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { runPurge } = require('./manage');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
global.client = client;
const args = process.argv.slice(2);

client.once('ready', async function run () {
  const filter = args[0]
  ? (guild => (guild.id == args[0]))
  : (() => true);
  const purge = runPurge(filter);
  
  purge.on('start', () => {
    console.log('Client ready to purge...');
  });
  
  purge.on('successPatch', (n, guild) => {
    console.log(`Purged ${n} commands for ${guild}.`);
  });
  
  purge.on('errorPatch', (e) => {
    console.error(`Error purging commands:`, e);
  });
  
  purge.on('end', () => {
    console.log("Client finished the purge.");
    process.exit(1);
  });
});

client.login(process.env.CLIENT_TOKEN);