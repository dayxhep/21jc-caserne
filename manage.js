const fs = require('fs');
const EventEmitter = require('node:events');
const { REST, Routes } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const Config = require('./env.json');

/**
* Deployment function
* @param {*} filter 
* @returns 
*/
function runDeploy (filter = (() => true)) {
  const COMMANDS_DIR = `./commands`;
  const commands = [];
  const commandFiles = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = require(`${COMMANDS_DIR}/${file}`);
    commands.push(command.data.toJSON());
  }
  
  const rest = new REST().setToken(Config.CLIENT_TOKEN);
  
  const observable = new EventEmitter();
  client.guilds.fetch().then(async guilds => {
    await wait(1000);
    observable.emit('start', guilds.filter(filter));
    let proms = [];
    guilds.filter(filter).forEach(_guild => {
      let prom = new Promise(async (resolve, reject) => {
        const guild = await client.guilds.cache.get(_guild.id);
        
        rest.put(Routes.applicationGuildCommands(Config.CLIENT_ID, _guild.id), { body: commands })
        .then(async () => {
          observable.emit('successPatch', commands, guild);
          resolve();
        })
        .catch(e => {
          observable.emit('errorPatch', e);
          reject(e);
        });
      });
      proms.push(prom);
    });
    
    Promise.all(proms).then(() => {
      observable.emit('end');
    });
  });
  return observable;
};

/**
* Purge function
* @param {*} filter 
* @returns 
*/
function runPurge (filter = (() => true)) {
  const observable = new EventEmitter();
  client.guilds.fetch().then(async guilds => {
    await wait(1000);
    let proms = [];
    observable.emit('start', guilds.filter(filter));
    guilds.filter(filter).forEach(_guild => {
      let prom = new Promise(async (resolve, reject) => {
        const guild = await client.guilds.cache.get(_guild.id);
        const allCommands = await guild.commands.fetch();
        const n = allCommands.size;
        guild.commands.set([]).then(() => {
          observable.emit('successPatch', n, guild);
          resolve();
        }).catch(e => {
          observable.emit('errorPatch', e);
          reject(e);
        });
      });
      proms.push(prom);
    });
    
    Promise.all(proms).then(() => {
      observable.emit('end');
    });
  });
  return observable;
}

module.exports = {runDeploy, runPurge};