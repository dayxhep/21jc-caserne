const Config = require('./env.json');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { runDeploy } = require('./manage');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
global.client = client;
const args = process.argv.slice(2);

client.once(Events.ClientReady, async function run () {
  const filter = args[0]
  ? (guild => (guild.id == args[0]))
  : (() => true);
  const deploy = runDeploy(filter);
  
  deploy.on('start', () => {
    console.log('Client ready to deploy...');
  });
  
  deploy.on('successPatch', (commands, guild) => {
    console.log(`Deployed ${commands.length} commands for ${guild}.`);
  });
  
  deploy.on('errorPatch', (e) => {
    console.error(`Error deploying commands:`, e);
  });
  
  deploy.on('end', () => {
    console.log("Client finished to setup permissions.");
    process.exit(1);
  });
});

client.login(Config.CLIENT_TOKEN);