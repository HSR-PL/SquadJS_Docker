import { EmbedBuilder } from 'discord.js';

import { COPYRIGHT_MESSAGE } from '../utils/constants.js';

import DiscordBaseMessageUpdater from './discord-base-message-updater.js';

export default class DiscordServerPlayers extends DiscordBaseMessageUpdater {
  static get description() {
    return 'The <code>DiscordServerPlayers</code> plugin can be used to get the server player list in Discord.';
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
        default: '!players'
      },
      updateInterval: {
        required: false,
        description: 'How frequently to update the time in Discord.',
        default: 60 * 1000
      },
      color: {
        required: false,
        description: 'Color to use on small stuff to make things look cool',
        // default: '#FFFFFF'
        default: 16777215
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.updateMessages = this.updateMessages.bind(this);
    this.TEAM_ONE_ID = '1';
  }

  async mount() {
    await super.mount();
    this.updateInterval = setInterval(this.updateMessages, this.options.updateInterval);
  }

  async unmount() {
    await super.unmount();
    clearInterval(this.updateInterval);
  }

  async generateMessage() {
    var playerListByTeam = this.buildPlayerListByTeam(this.server.players);
    const embed = new EmbedBuilder();

    // Set embed title.
    embed.setTitle("Players");

    embed.addFields(
      { name: `${this.server.currentLayer?.teams[0].faction}  (${playerListByTeam.teamOneCount} players)`, value: `\`\`\`${playerListByTeam.teamOne}\`\`\``, inline: true },
      { name: `${this.server.currentLayer?.teams[1].faction}  (${playerListByTeam.teamTwoCount} players)`, value: `\`\`\`${playerListByTeam.teamTwo}\`\`\``, inline: true },
    );

    // Set timestamp.
    embed.setTimestamp(new Date());

    // Set footer.
    embed.setFooter(
      {
        text: COPYRIGHT_MESSAGE,
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

  buildPlayerListByTeam = (playerArrayMixed) => {
    const playerByTeam = { teamOne: '', teamTwo: '', teamOneCount: 0, teamTwoCount: 0 };

    playerArrayMixed.forEach((player) => {
      if (player.teamID === this.TEAM_ONE_ID) {
        playerByTeam.teamOne += player.name + '\n';
        playerByTeam.teamOneCount++;
      } else {
        playerByTeam.teamTwo += player.name + '\n';
        playerByTeam.teamTwoCount++;
      }
    });

    if (playerByTeam.teamOneCount === 0) playerByTeam.teamOne = 'Empty';
    if (playerByTeam.teamTwoCount === 0) playerByTeam.teamTwo = 'Empty';

    return playerByTeam;
  }
}
