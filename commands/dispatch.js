const { SlashCommandBuilder, italic, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder, bold } = require('discord.js');
const fs = require('node:fs/promises');
const VEHICULES_FILES = './vehicules.json';

module.exports = {
  name: 'dispatch',
	data: new SlashCommandBuilder()
		.setName('dispatch')
		.setDescription('Créé un panel de dispatch'),
	async execute(interaction) {
		await interaction.deferReply();
    const chn = await interaction.guild.channels.fetch(interaction.channelId);
		let oldMsgs = await chn.messages.fetch()
		oldMsgs = oldMsgs.filter(m => m.author.id === process.env.CLIENT_ID);
		oldMsgs.forEach(message => {
			try {
        message.delete();
      } catch (error) {}
		});
    interaction.guild.panelMsg = await chn.send(this.getPanelMsg(interaction));
    await chn.send({
      content: `### Disponibilité`,
			components: this.dispComponents()
		});
    await chn.send({
      content: `### Mon dispatch`,
			components: this.myDispatchComponents()
		});
    await chn.send({
      content: `### Gérer une unité du dispatch`,
			components: this.otherDispatchComponents()
		});
    try {
      const ir = await interaction.followUp({embeds: [emb(`Création d'un nouveau panel`)], ephemeral: true});
      setTimeout(() => ir.delete().catch(e), 5000);
    } catch (error) {}
	},
  ephemeralReply(i, embed, hideable = true) {
    if(!i.deferred && !i.replied) {
      try {
        if(hideable) {
          return i.reply({content: '✔', ephemeral: true}).then(e => e.delete());
        }
        i.reply({embeds: [embed], ephemeral: true})
          .then(ir => setTimeout(() => ir.delete(), 5000));
      } catch (error) {}
    }
  },
	async init() {
		client.on(Events.InteractionCreate, async i => {
      if(!i.guild.userMap) i.guild.userMap = {};
      if(!i.guild.panelMsg) {
        await this.execute(i);
      }
			if (i.isButton() && i.customId === 'yesDisp') {
				i.guild.userMap[i.member.toString()] = '__disp';
				this.ephemeralReply(i, emb(`Vous êtes maintenant disponible pour le dispatch`))
        this.update(i)
			}
      if (i.isButton() && i.customId === 'hurtDisp') {
				i.guild.userMap[i.member.toString()] = '__hurt';
				this.ephemeralReply(i, emb(`Vous êtes maintenant marqué comme blessé`))
        this.update(i)
			}
			if (i.isButton() && i.customId === 'noDisp') {
				if(i.guild.userMap[i.member.toString()]) delete i.guild.userMap[i.member.toString()];
        this.ephemeralReply(i, emb(`Vous êtes maintenant hors dispatch`).setColor(0xE9573F))
        this.update(i)
			}
      if (i.isStringSelectMenu() && i.customId === 'addMeVehicule') {
				i.guild.userMap[i.member.toString()] = i.values[0];
        this.ephemeralReply(i, emb(`Vous êtes maintenant disponible pour le dispatch`))
        this.update(i)
			}
      if (i.isUserSelectMenu() && i.customId === 'addOtherUser') {
				i.member.lastUserDispatch = i.values[0];
        if(i.member.lastVehiculeDispatch) {
          this.dispatchUnit(i)
        } else {
          this.ephemeralReply(i, emb(`Vous gérez ${i.member.lastUserDispatch}`))
        }
			}
      if (i.isStringSelectMenu() && i.customId === 'addOtherVehicule') {
        i.member.lastVehiculeDispatch = i.values[0];
        if(i.member.lastUserDispatch) {
          this.dispatchUnit(i)
        } else {
          this.ephemeralReply(i, emb(`Vous gérez ${i.member.lastVehiculeDispatch}`))
        }
			}
		});
    this.vehicules = await this.loadData();
	},
  async dispatchUnit(i) {
    const user = await i.guild.members.fetch(i.member.lastUserDispatch);
    const value = i.member.lastVehiculeDispatch;
    if(value === '__nodisp') {
      if(i.guild.userMap[user.toString()]) delete i.guild.userMap[user.toString()];
      this.ephemeralReply(i, emb(`🔴 ${user.toString()} est hors dispatch`).setColor(0xE9573F))
    } else if(value === '__disp') {
      i.guild.userMap[user.toString()] = value;
      this.ephemeralReply(i, emb(`🟢 ${user.toString()} est disponible`))
    } else if(value === '__hurt') {
      i.guild.userMap[user.toString()] = value;
      this.ephemeralReply(i, emb(`🟡 ${user.toString()} est blessé`))
    } else {
      i.guild.userMap[user.toString()] = value;
      this.ephemeralReply(i, emb(`Vous avez ajouté ${user.toString()} à ${this.stringVehicule(value)}`))
    }
    this.update(i)
  },
  stringVehicule(id) {
    const vh = this.vehicules[id];
    if(!vh) return `${italic('Véhicule inconnu')}`
    return `${vh.emoji} ${vh.name}`;
  },
  async update(i) {
    // sécurité si 10 joueurs cliquent en même temps en moins de 500ms pour synchro les updates
    if(i.guild.updating) return;
    i.guild.updating = true;
    setTimeout(async () => {
      i.guild.panelMsg = await i.guild.panelMsg.edit(this.getPanelMsg(i));
      i.guild.updating = false;
    }, 500);
  },
  getPanelMsg(i) {
    return { 
      content: `## Récap du dispatch`,
			embeds: [this.panel(i), this.disp(i)],
		}
  },
	disp(i) {
    const users = this.get(i, ([_, value]) => value === '__disp');
    const users2 = this.get(i, ([_, value]) => value === '__hurt');
    const txt = users.length ? `${users.map(u => `🟢 ${u}`).join(' , ')}` : italic('Aucune unité disponible');
    const txt2 = users2.length ? `${users2.map(u => `🟡 ${u}`).join(' , ')}` : italic('Aucune unité blessé');
		return emb([
      `✅  ${bold('Unités disponibles')} (${users.length})`,
      '',
      txt,
      '',
      `♿️  ${bold('Unités blessées')} (${users2.length})`,
      '',
      txt2
    ].join('\n'));
	},
	panel(i) {
    const users = this.get(i, ([_, value]) => value !== '__disp' && value !== '__hurt');
    const embed = emb(italic('Aucune unité dans le dispatch'))
      .setTitle(`📢  Panel de dispatch (${users.length})`);
    if(users.length) {
      embed.setDescription((new Array(27)).fill().map(() => `▪️`).join(''))
      .addFields([
        {name: 'Nb. unit ▪️', value: ' ', inline: true}, 
        {name: 'Véhicule ▪️', value: ' ', inline: true}, 
        {name: 'Effectif', value: ' ', inline: true},
        ...Object.keys(this.vehicules).sort().filter(v => this.get(i, ([_, _v]) => v === _v).length).map(v => ([
          {name: '\u200b', value: `▪️ ${bold(this.get(i, ([_, _v]) => v === _v).length)}` + '', inline: true}, 
          {name: '\u200b', value: this.stringVehicule(v), inline: true}, 
          {name: '\u200b', value: this.get(i, ([_, _v]) => v === _v).join(', '), inline: true},
        ])).flat()
      ])
    }
		return embed;
	},
	dispComponents() {
		return [new ActionRowBuilder()
			.addComponents(
        new ButtonBuilder()
          .setCustomId('yesDisp')
          .setLabel('Disponible')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('hurtDisp')
          .setLabel('Blessé')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('noDisp')
          .setLabel('Hors dispatch')
          .setStyle(ButtonStyle.Danger)
			)]
	},
  myDispatchComponents() {
    return [
      new ActionRowBuilder()
			.addComponents(
        this.vehiculesSelectComponent('addMeVehicule', `J'embarque dans...`)
      )
    ]
  },
	otherDispatchComponents() {
		return [
      new ActionRowBuilder()
			.addComponents(
        new UserSelectMenuBuilder()
          .setCustomId('addOtherUser')
          .setPlaceholder(`Choix de l'unité`),
      ),
      new ActionRowBuilder()
      .addComponents(
        this.vehiculesSelectComponent('addOtherVehicule', `Ajouter l'unité à...`, true)
      )
    ]
	},
  vehicules: {},
	get(i, filter) {
		return Object.entries(i.guild.userMap)
			.filter(filter)
			.map(([user]) => user)
	},
  vehiculesSelectComponent(id, label, withDisp = false) {
    let select = new StringSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder(label);
    if(withDisp) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Disponible')
          .setValue('__disp')
          .setEmoji('🟢')
      )
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Blessé')
          .setValue('__hurt')
          .setEmoji('🟡')
      )
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Hors dispatch')
          .setValue('__nodisp')
          .setEmoji('🔴')
      )
    }
    Object.entries(this.vehicules).sort(([i, a], [j, b]) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }).forEach(([_id, vh]) => {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(vh.name)
          .setEmoji(vh.emoji)
          .setValue(_id)
      )
    });
    return select;
  },
  async loadData() {
		return JSON.parse(
			await fs.readFile(VEHICULES_FILES)
		);
	},
};