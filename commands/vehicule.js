const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs/promises');
const VEHICULES_FILES = './vehicules.json';

module.exports = {
  name: 'vehicule',
	data: new SlashCommandBuilder()
		.setName('vehicule')
		.setDescription('Gestion des véhicules')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Ajoute un nouveau véhicule - ⚠️ Pensez à faire /dispatch pour mettre à jour la liste des véhicules')
				.addStringOption(option => option.setName('nom').setDescription('Nom du véhicule (ex: Rescue 1)').setRequired(true))
				.addStringOption(option => option.setName('emoji').setDescription('Emoji de https://getemoji.com/ (ex: 🚨)').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Supprime un véhicule - ⚠️ Pensez à faire /dispatch pour mettre à jour la liste des véhicules')
				.addStringOption(option => option.setName('nom').setDescription('Nom du véhicule (ex: Rescue 1)').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Affiche la liste des véhicules')
	),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		if (interaction.options.getSubcommand() === 'delete') {
			const name = interaction.options.getString('nom');
			this.deleteVehicule(interaction, name);
		} else if (interaction.options.getSubcommand() === 'add') {
			const name = interaction.options.getString('nom');
			const emoji = interaction.options.getString('emoji').trim();
      if (emoji.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu)) {
        this.addVehicule(interaction, name, emoji);
      } else {
        interaction.editReply({embeds:[
          embErr(`L'emoji sélectionné est invalide, merci de sélectionner un emoji de base Discord`)
        ], ephemeral: true});
      }
		} else if (interaction.options.getSubcommand() === 'list') {
      let vehicules = await this.loadData();
			interaction.editReply({embeds:[emb(`${Object.keys(vehicules).sort().map(k => {
				const vh = vehicules[k];
				return `${vh.emoji} ${vh.name}\t\t (\`${k}\`)`
			}).join('\n')}`).setTitle('Liste des véhicules')],
			ephemeral: true});
		}
	},
  async addVehicule(interaction, name, emoji) {
    let vehicules = await this.loadData();
    const id = this.nameToId(name);
    if(!vehicules[id]) {
      vehicules[id] = {
        name,
        emoji
      };
      await this.saveData(vehicules);
      interaction.editReply({embeds:[emb(`Véhicule \`${name}\` ajouté.`)], ephemeral: true});
      client.commands.get('dispatch').vehicules = await this.loadData();
    } else {
      interaction.editReply({embeds:[embErr(`Le véhicule \`${name}\` existe déjà.`)], ephemeral: true})
    }
  },
  async deleteVehicule(interaction, name) {
    let vehicules = await this.loadData();
    const id = this.nameToId(name);
    if(vehicules[id]) {
      delete vehicules[id];
      await this.saveData(vehicules);
      interaction.editReply({embeds:[emb(`Véhicule \`${name}\` supprimé.`)], ephemeral: true});
      client.commands.get('dispatch').vehicules = await this.loadData();
    } else {
      interaction.editReply({embeds:[embErr(`Véhicule \`${name}\` introuvable.`)], ephemeral: true})
    }
  },
	nameToId(str) {
		return str.replace(/\W/g, '').toLowerCase()
	},
	async loadData() {
		return JSON.parse(
			await fs.readFile(VEHICULES_FILES)
		);
	},
	async saveData(data) {
		await fs.writeFile(
			VEHICULES_FILES,
			JSON.stringify(data, null, '\t')
		);
	}
};