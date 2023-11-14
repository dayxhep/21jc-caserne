const { EmbedBuilder } = require("discord.js");

global.emb = (str) => {
  return new EmbedBuilder()
    .setDescription(str)
    .setColor(0x2ECC71);
}

global.embErr = (str) => {
  return new EmbedBuilder()
    .setDescription(':x: ' + str)
    .setColor(0xD8334A);
}

global.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}