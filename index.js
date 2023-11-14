require('dotenv').config();

const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
const { loadCommands } = require('./helpers');
const globals = require('./globals');

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent,
], partials: [
	Partials.Message,
	Partials.Channel,
	Partials.Reaction
]});

global.client = client;

loadCommands(client);

client.once(Events.ClientReady, async () => {
	console.log('[START] The bot started.');
	client.commands.forEach(command => {
		if(command.init) command.init(client);
	});
	client.adminCmds.forEach(command => {
		if(command.init) command.init(client, process.env.AUTHOR_ID);
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isCommand()) return;
	
	const command = client.commands.get(interaction.commandName);
	
	if (!command) return;
	
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if(!interaction.replied && interaction.isRepliable()) {
			await interaction.reply({ embeds: [embErr('Cette commande est indisponible')] , ephemeral: true });
		}
	}
});

client.on(Events.MessageCreate, async message => {
	const adminCmd = client.adminCmds.get(message.content.split(' ')[0]);
	if(!adminCmd || message.author.id !== process.env.AUTHOR_ID) return;
	
	try {
		await adminCmd.execute(message, client);
	} catch (error) {
		console.error(error);
	}
});

client.login(process.env.CLIENT_TOKEN);