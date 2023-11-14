module.exports = {
  name: '/restart',
  async execute(message) {
    await message.reply({embeds: [emb(`Restarting soon...`)]});
    process.exit(1);
  }
};