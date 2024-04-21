import Discord, { SlashCommandBuilder } from 'discord.js';
import BasePlugin from './base-plugin.js';
import { COPYRIGHT_MESSAGE } from '../utils/constants.js';

// import { LayersFractionsMixin } from './mapvote-extended.js';

import Layer from '../layers/layer.js';
import Layers from '../layers/layers.js';
// import { setManualNextMapList } from './mapvote-extended.js';

import MapVoteExtended from "./mapvote-extended.js";
// export default class DiscordMapVoteExtendedNextmap extends MapVoteExtended {


// export default class DiscordMapVoteExtendedNextmap extends LayersFractionsMixin(BasePlugin) {
export default class DiscordMapVoteExtendedNextmap extends BasePlugin {
  static get description() {
    return 'The <code>DiscordMapVoteExtendedNextmap</code> plugin can be used to set nextmaps list in Discord.';
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      discordClient: {
        required: true,
        description: 'Discord connector name.',
        connector: 'discord',
        default: 'discord'
      },
      command: {
        required: false,
        description: 'Command name to get message.',
        default: '!nextmaps'
      },
      fractionLongDisplayType: {
        required: false,
        description: 'Fraction long name type switch.',
        default: true
      },
      channelIDs: {
        required: false,
        description: 'The bot will only answer with a placeholder in these channels',
        default: [],
        example: ['667741905228136459']
      },
      discordRole: {
        required: false,
        description: 'Slash commands will work only for users withthis role',
        default: "",
        example: "Server Admin"
      },
      color: {
        required: false,
        description: 'Color to use on small stuff to make things look cool',
        default: 16777215
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);
    this.mapVoteExtended = new MapVoteExtended(server, options, connectors);

    this.escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    this.onMessage = this.onMessage.bind(this);
  }

  async mount() {
    this.options.discordClient.on('messageCreate', this.onMessage);

    const helpppCommand = new SlashCommandBuilder()
      .setName('helppp')
      .setDescription('command helppp')
      .addStringOption((option) =>
        option
          .setName('command')
          .setDescription('The command to get help for.')
          .setRequired(true)
          .setAutocomplete(true)
      );

    const nextmapsCommand = new SlashCommandBuilder()
      .setName('nextmaps')
      .setDescription('Set the next maps to be played');

    for (let i = 1; i <= 15; i++) {
      nextmapsCommand.addStringOption((option) =>
        option
          .setName(`map${i}`)
          .setDescription(`The ${i}th map to be played next.`)
          .setRequired(i === 1) // only the first map is required
          .setAutocomplete(true)
      );
    }

    this.options.discordClient.on('interactionCreate', async (interaction) => {
      console.log('Received an interaction');
      const hasRole = interaction.member.roles.cache.some(r => r.name === "Serwer Admin")

      if (hasRole) {


        if (interaction.isCommand()) {
          console.log('Received a command:', interaction.commandName);
          console.log('Options:', interaction.options.data);

          if (interaction.commandName === 'nextmaps') {
            console.log('Handling /nextmaps command');
            const maps = [];
            for (let i = 1; i <= 15; i++) {
              const map = interaction.options.getString(`map${i}`);
              if (map) {
                maps.push(map);
              } else {
                break;
              }
            }
            console.log('Maps:', maps.join(','));

            // Check if all maps are valid
            const invalidMaps = maps.filter(map => !this.layerIDs.includes(map));
            if (invalidMaps.length > 0) {
              await interaction.reply(`Invalid maps: ${invalidMaps.join(', ')}`);
              return;
            }

            await interaction.reply(`Next maps set: ${maps.join(', ')}`);


            if (global.manualNextMapList != null && typeof global.manualNextMapList !== 'undefined' && global.manualNextMapList.length > 0) {
              global.checkManualNextMapListNull = false;
              console.log(`test 1if: ` + global.checkManualNextMapListNull);
              // } else if (global.manualNextMapList != null && typeof global.manualNextMapList !== 'undefined' && global.manualNextMapList.length == 0) {
              //   global.checkManualNextMapListNull = false;
              //   console.log(`test 2if: `+global.checkManualNextMapListNull);
            } else {
              global.checkManualNextMapListNull = true;
              console.log(`test ifelse: ` + global.checkManualNextMapListNull);
            }
            console.log("DISCORD BOT CHECK");
            console.log(global.manualNextMapList != null);
            console.log(typeof global.manualNextMapList !== 'undefined');
            console.log(global.manualNextMapList.length);
            console.log(global.manualNextMapList);
            console.log("DISCORD BOT CHECK END");

            await this.mapVoteExtended.setManualNextMapList(maps);
            if (global.checkManualNextMapListNull === true) {
              console.log(global.checkManualNextMapListNull);
              // Logger.verbose('MapVoteExtended', 2, `DISCORD BOT Nextmap list was null, setting new nextmap from list: ${checkedNextMapList} `);
              await this.mapVoteExtended.setNextMapFromList();
            }


          }
        } else if (interaction.isAutocomplete()) {
          console.log('Handling autocomplete');
          const focusedOption = interaction.options.getFocused(true);
          const userInput = focusedOption.value;
          const layerIDs = Layers.layers.map(layer => layer.layerid);

          // Create a map where the key is the part of the name before the first "_"
          const layerMap = new Map();
          for (const id of layerIDs) {
            const prefix = id.split('_')[0];
            if (!layerMap.has(prefix)) {
              layerMap.set(prefix, []);
            }
            layerMap.get(prefix).push(id);
          }

          const options = [];

          // If the user input includes "_", suggest the variants of the map
          if (userInput.includes('_')) {
            const [mapName, variantStart] = userInput.split('_');
            if (layerMap.has(mapName)) {
              const variants = layerMap.get(mapName).filter(variant => variant.startsWith(userInput));
              options.push(...variants.map(variant => ({name: variant, value: variant})));
            }
          } else {
            // Suggest the map names
            const mapNames = Array.from(layerMap.keys()).filter(name => name.startsWith(userInput));
            options.push(...mapNames.map(name => ({name, value: name})));

            // If there is still room for suggestions, suggest the variants of the maps
            if (options.length < 25) {
              for (const name of mapNames) {
                const variants = layerMap.get(name);
                options.push(...variants.map(variant => ({name: variant, value: variant})));
                if (options.length >= 25) {
                  break;
                }
              }
            }
          }

          // Limit the number of suggestions to 25
          interaction.respond(options.slice(0, 25));
        }

      }

    });

    const helpppData = {
      name: 'helppp',
      description: 'command helppp',
      options: [{
        name: 'command',
        type: 3, // Use 3 for STRING type
        description: 'The command to get help for.',
        required: true,
        autocomplete: true,
      }],
    };

    const nextmapsData = nextmapsCommand.toJSON();

    this.options.discordClient.application.commands.create(helpppData)
      .then(console.log)
      .catch(console.error);

    this.options.discordClient.application.commands.create(nextmapsData)
      .then(console.log)
      .catch(console.error);

    this.updateLayerIDs();
    setInterval(() => this.updateLayerIDs(), 60 * 60 * 1000); // Update every hour
  }

  async updateLayerIDs() {
    Layers.pull();
    this.layerIDs = Layers.layers.map(layer => layer.layerid);
    console.log(this.layerIDs);
  }

  async unmount() {
    this.options.discordClient.removeEventListener('messageCreate', this.onMessage);
  }

  async onMessage(message) {
    if (message.author.bot) return;
    if (this.options.channelIDs.length > 0 && !this.options.channelIDs.includes(message.channel.id)) return;

    if (message.content.startsWith(this.options.command)) {
      // let messageSplit = message.content.split(/\s+/);
      // let steamID = '76561197989449645';
      // console.log('pre Maps2:', steamID, messageSplit.slice(1));
      // let maps2 = await this.checkLayerid(steamID, messageSplit.slice(1));
      // console.log('Maps2:', maps2.join(','));
      // // let maps2 = message.content.slice(this.options.command.length).trim().split(/\s+/);

      const maps = message.content.slice(this.options.command.length).trim().split(/\s+/);
      console.log('Maps:', maps.join(','));

      // Check if all maps are valid
      const invalidMaps = maps.filter(map => !this.layerIDs.includes(map));
      if (invalidMaps.length > 0) {
        await message.channel.send(`Invalid maps: ${invalidMaps.join(', ')}`);
        return;
      }

      await message.channel.send(`Next maps set: ${maps.join(', ')}`);

      if (global.manualNextMapList != null && typeof global.manualNextMapList !== 'undefined' && global.manualNextMapList.length > 0) {
        global.checkManualNextMapListNull = false;
        console.log(`test 1if: `+global.checkManualNextMapListNull);
      } else {
        global.checkManualNextMapListNull = true;
        console.log(`test ifelse: `+global.checkManualNextMapListNull);
      }
      console.log("DISCORD BOT CHECK");
      console.log(global.manualNextMapList != null);
      console.log(typeof global.manualNextMapList !== 'undefined');
      console.log(global.manualNextMapList.length);
      console.log(global.manualNextMapList);
      console.log("DISCORD BOT CHECK END");

      // await this.setManualNextMapList(maps);
      await this.mapVoteExtended.setManualNextMapList(maps);
      if (global.checkManualNextMapListNull === true) {
        console.log(global.checkManualNextMapListNull);
        await this.mapVoteExtended.setNextMapFromList();
      }
    } else if (message.content.startsWith('!clearnextmaps')) {
      console.log('Clearing map list');
      await message.channel.send(`Map list cleared`);
      global.manualNextMapList = [];
    }
  }



}
