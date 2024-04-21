import BasePlugin from './base-plugin.js';

export default class BroadcastExtended extends BasePlugin {
    static get description() {
        return 'The <code>BroadcastExtended</code> plugin allow to set custom shortcuts with broadcast messages for admins .';
    }

    static get defaultEnabled() {
        return false;
    }

    static get optionsSpecification() {
        return {
            voteDuration: {
                required: false,
                // default: 300,
                default: 10,
                description: 'Map vote duration in seconds'
            }
        };
    }

    constructor(server, options, connectors) {
        super(server, options, connectors);
        this.onChatMessage = this.onChatMessage.bind(this);
    }

    async mount() {
        this.server.on('CHAT_MESSAGE', this.onChatMessage);
    }

    async unmount() {
        this.server.removeEventListener('CHAT_MESSAGE', this.onChatMessage);
    }

    async onChatMessage(info) {
        const admins = await this.server.getAdminsWithPermission('canseeadminchat');

        if (info.message.match(/^!(b )/i)) {
            if (admins.includes(info.player.steamID)) {
                var messageSplit = info.message.split(" ");
                console.log(`call custom broadcast:`);
                await this.server.rcon.warn(info.player.steamID, 'call custom broadcast');
            }
        }

        if (info.message.match(/^!(bset )/i)) {
            if (admins.includes(info.player.steamID)) {
                var messageSplit = info.message.split(" ");
                console.log(`set custom broadcast:`);
                await this.server.rcon.warn(info.player.steamID, 'set custom broadcast');
            }
        }

        if (info.message.match(/^!(w )/i)) {
            if (admins.includes(info.player.steamID)) {
                var messageSplit = info.message.split(" ");
                console.log(`call custom broadcast:`);
                await this.server.rcon.warn(info.player.steamID, 'call custom warn');
            }
        }

        if (info.message.match(/^!(wset )/i)) {
            if (admins.includes(info.player.steamID)) {
                var messageSplit = info.message.split(" ");
                console.log(`set custom broadcast:`);
                await this.server.rcon.warn(info.player.steamID, 'set custom warn');
            }
        }

        if (info.message.match(/^!(nextmap)/i)) {
            if (admins.includes(info.player.steamID)) {
                console.log('nextmap broadcast');
                await this.server
            }
        }




    }

}