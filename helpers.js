const { Collection } = require('discord.js');
const fs = require('fs');

module.exports = {
  secondsToDuration: (s) => {
    let time = parseInt(s || 0) || 0;
    const hours = Math.floor(time / 3600);
    time %= 3600;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    let times = [hours, minutes, seconds].filter(a => a > 0);
    
    if(times.length === 1) {
      times = ['0', times[0]];
    }
    
    return times.map((a, i) => (i === 0 ? a : `${a}`.padStart(2, '0')))
      .join(':');
  },
  
  loadCommands: (client) => {
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      client.commands.set(command.data.name, command);
    }
    
    client.adminCmds = new Collection();
    const adminCmds = fs.readdirSync('./admin').filter(file => file.endsWith('.js'));
    
    for (const file of adminCmds) {
      const adminCmd = require(`./admin/${file}`);
      client.adminCmds.set(adminCmd.name, adminCmd);
    }
  }
};