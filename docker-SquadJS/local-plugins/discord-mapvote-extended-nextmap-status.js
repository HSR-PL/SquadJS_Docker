import { ActivityType, EmbedBuilder } from 'discord.js';

import { COPYRIGHT_MESSAGE } from '../utils/constants.js';

import DiscordBaseMessageUpdater from './discord-base-message-updater.js';

// import listNextMaps from './mapvote-extended.js';

// import MapVoteExtended from './mapvote-extended.js';

// import { LayersFractionsMixin } from './mapvote-extended.js';
import MapVoteExtended from './mapvote-extended.js';

// export default class DiscordMapVoteExtendedNextmapStatus extends LayersFractionsMixin(DiscordBaseMessageUpdater) {
export default class DiscordMapVoteExtendedNextmapStatus extends DiscordBaseMessageUpdater {
  static get description() {
    return 'The <code>DiscordMapVoteExtendedStatus</code> plugin can be used to get the server defined nextmaps list in Discord.';
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
      return {
        ...DiscordBaseMessageUpdater.optionsSpecification,
        command: {
          required: false,
          description: 'Command name to get message.',
          default: '!listnextmaps'
        },
        fractionLongDisplayType: {
          required: false,
          description: 'Fraction long name type switch.',
          default: true
        },
        updateInterval: {
          required: false,
          description: 'How frequently to update the time in Discord.',
          default: 6 * 1000
        },
        setBotStatus: {
          required: false,
          description: "Whether to update the bot's status with nextmaps information.",
          default: true
        },
        color: {
          required: false,
          description: 'Color to use on small stuff to make things look cool',
          default: 65280
        }
      };
    }

  constructor(server, options, connectors) {
    super(server, options, connectors);
    this.mapVoteExtended = new MapVoteExtended(server, options, connectors);

    this.updateMessages = this.updateMessages.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  async mount() {
    await super.mount();
    this.updateInterval = setInterval(this.updateMessages, this.options.updateInterval);
    this.updateStatusInterval = setInterval(this.updateStatus, this.options.updateInterval);
  }

  async unmount() {
    await super.unmount();
    clearInterval(this.updateInterval);
    clearInterval(this.updateStatusInterval);
  }

  async generateMessage() {
    console.log('Generating message...');

    const embed = new EmbedBuilder();

    console.log('global.manualNextMapList: ', global.manualNextMapList);

    // console.log(this.options.command);
    // // console.log(DiscordBaseMessageUpdater.arguments);
    // console.log('!@#om#@!');
    // console.log(DiscordBaseMessageUpdater.optionsSpecification.command);
    // console.log(JSON.stringify(this.updateMessages.bind(this)));
    // console.log(this.message);
    // console.log('#@!om!@#');

    embed.setTitle("NextMaps");

    if (global.manualNextMapList != null && typeof global.manualNextMapList !== 'undefined' && global.manualNextMapList.length > 0) {
      console.log('Processing manualNextMapList...');

      // console.log(global.manualNextMapList.unshift(this.server.currentLayer.name));
      // const manualNextMapList = global.manualNextMapList.unshift(this.server.currentLayer.name)
      const manualNextMapList = [].concat(this.server.nextLayer.name.replace(/ /g, '_'), global.manualNextMapList);
      console.log(global.manualNextMapList);
      console.log(manualNextMapList);

      let fractionsList = this.mapVoteExtended.getLayersFractions(manualNextMapList, this.options.fractionLongDisplayType);

      this.nextMapsList = {
        // layers: global.manualNextMapList,
        layers: manualNextMapList,
        fractions: fractionsList
      };

      global.nextMapsListMessage = this.nextMapsList.layers.map((layerName, index) => `[${index + 1}] - ${layerName} ${this.nextMapsList.fractions[index]}`).join('\n');

      embed.addFields(
        // { name: `Defined custom next maps list is:`, value: `\`\`\`${test}\`\`\``, inline: false },
        { name: `Defined custom next maps list is:`, value: `\`\`\`${nextMapsListMessage}\`\`\``, inline: false },
        // { name: `tttt`, value: `\`\`\`two\`\`\``, inline: true },
      );
    }
    else {
      console.log('manualNextMapList is empty or undefined');
      embed.addFields(
        // { name: `Defined custom next maps list is:`, value: `\`\`\`${test}\`\`\``, inline: false },
        { name: `Defined custom next maps list is empty`, value: `\`\`\`'Use !nextmap command in game to define custom next maps list'\`\`\``, inline: false },
        // { name: `tttt`, value: `\`\`\`two\`\`\``, inline: true },
      );
    }

    embed.setTimestamp(new Date());

    // Set footer.
    embed.setFooter({
      text: COPYRIGHT_MESSAGE+', extended by Seth ;)',
      iconURL: null
    });

    // Set gradient embed color.
    embed.setColor(
      this.options.color
    );

    return {
      embeds: [embed]
    };
  }

  async updateStatus() {
    if (!this.options.setBotStatus) return;

    console.log('ttttttest');
    console.log('est '+await global.nextMapsListMessage);
    // const ttt = global.nextMapsListMessage.replace(/\n/g, ' ');
    // const ttt = global.nextMapsListMessage;
    // console.log(ttt);
    console.log(`${"".concat("(", this.server.a2sPlayerCount, "/", this.server.publicSlots,")", this.server.currentLayer?.name || 'Unknown', " next: ", [].concat(await this.server.nextLayer.name, await global.manualNextMapList)).replace(/_/g, ' ').substring(0, 128)}`);

    await this.options.discordClient.user.setPresence({
      // `${global.nextMapsListMessage.substring(0, 128)}`,
      activities: [
        {
          name: `${"".concat("(", this.server.a2sPlayerCount, "/", this.server.publicSlots,")", this.server.currentLayer?.name || 'Unknown', " next: ", [].concat(await this.server.nextLayer.name, await global.manualNextMapList)).replace(/_/g, ' ').substring(0, 128)}`,
          type: ActivityType.Watching
        }
      ],
      status: 'online'
    });
  }
}