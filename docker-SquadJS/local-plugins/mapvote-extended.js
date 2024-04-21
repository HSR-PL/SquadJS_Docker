import BasePlugin from './base-plugin.js';
import Logger from 'core/logger';
import Layers from '../layers/layers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export const LayersFractionsMixin = Base => class extends Base {
//     async getLayersFractions(layersId, longDisplayType) {
//         Layers.pull();

//         var fractions = [];
//         if (longDisplayType === true) {
//             for (var i = 0; i < layersId.length; i++) {
//                 const exist = Layers.layers.filter(layer => layer.layerid.includes(layersId[i]));
//                 if (exist.length === 1) {
//                     fractions.push(`(`+exist[0].teams[0].faction+` vs `+exist[0].teams[1].faction+`)`);
//                 }
//             }
//         }
//         else {
//             //change it later to first letter from name
//             // // fix names
//             var fractionsShort = {
//                 // 'Australian Defence Force': 'AUS',
//                 'Australian Defence Force': 'ADF',
//                 'British Army': 'GB',
//                 'British Army': 'BAF',
//                 'British Armed Forces': 'BAF',
//                 'Canadian Army': 'CAF',
//                 'Canadian Armed Forces': 'CAF',
//                 // 'Irregular Militia Forces': 'MIL',
//                 'Irregular Militia Forces': 'IMF',
//                 'Insurgent Forces': 'INS',
//                 'Middle Eastern Alliance': 'MEA',
//                 // 'Russian Ground Forces': 'RUS',
//                 'Russian Ground Forces': 'RGF',
//                 'Russian Airborne Forces': 'RAF',
//                 'United States Army': 'USA',
//                 'United States Marine Corps': 'USMC',
//                 'People\'s Liberation Army': 'PLA'
//             }
//             for (var i = 0; i < layersId.length; i++) {
//                 const exist = Layers.layers.filter(layer => layer.layerid.includes(layersId[i]));
//                 if (exist.length === 1) {

//                     // console.log(`---message2: `+JSON.stringify(exist[0].teams[0].faction));
//                     // console.log(`---message2: `+JSON.stringify(exist[0].teams[1].faction));
//                     fractions.push(`(`+fractionsShort[exist[0].teams[0].faction]+` vs `+fractionsShort[exist[0].teams[1].faction]+`)`);
//                 }
//             }
//         }


//         // //change it later to first letter from name
//         // var fractionsShort = {
//         //     'Australian Defence Force': 'AUS',
//         //     'Australian Defence Force': 'ADF',
//         //     'British Army': 'GB',
//         //     'British Army': 'BAF',
//         //     'Canadian Army': 'CAF',
//         //     'Irregular Militia Forces': 'MIL',
//         //     'Irregular Militia Forces': 'IMF',
//         //     'Insurgent Forces': 'INS',
//         //     'Middle Eastern Alliance': 'MEA',
//         //     'Russian Ground Forces': 'RUS',
//         //     'Russian Ground Forces': 'RGF',
//         //     'United States Army': 'USA',
//         //     'United States Marine Corps': 'USMC',
//         //     'People\'s Liberation Army': 'PLA'
//         // }
//         // for (var i = 0; i < layersId.length; i++) {
//         //     const exist = Layers.layers.filter(layer => layer.layerid.includes(layersId[i]));
//         //     if (exist.length === 1) {

//         //         // console.log(`---message2: `+JSON.stringify(exist[0].teams[0].faction));
//         //         // console.log(`---message2: `+JSON.stringify(exist[0].teams[1].faction));
//         //         fractions.push(`(`+fractionsShort[exist[0].teams[0].faction]+` vs `+fractionsShort[exist[0].teams[1].faction]+`)`);
//         //     }
//         // }

//         return fractions;
//     }

//     async setManualNextMapList(layersIds) {
//         global.manualNextMapList.push(...layersIds);
//         // this.manualNextMapList.push(...layersIds);
//         Logger.verbose('MapVoteExtended', 2, `Manual nextmap list set`);
//         Logger.verbose('MapVoteExtended', 3, `manual next map list: ${JSON.stringify(global.manualNextMapList)}`);
//         // Logger.verbose('MapVoteExtended', 3, `manual next map list: ${JSON.stringify(this.manualNextMapList)}`);
//     }

//     async setNextMapFromList() {
//         let NextMapList = global.manualNextMapList;
//         // let NextMapList = this.manualNextMapList;
//         Logger.verbose('MapVoteExtended', 3, `set next map from list: ${JSON.stringify(NextMapList)}`);
//         let manualNextMap = NextMapList.shift();
//         Logger.verbose('MapVoteExtended', 3, `set next map: ${JSON.stringify(manualNextMap)}`);
//         this.server.rcon.execute(`AdminSetNextLayer ${manualNextMap}`);
//         if (JSON.stringify(NextMapList) !== '[]') {
//             // await this.setManualNextMapList(await NextMapList);
//             Logger.verbose('MapVoteExtended', 2, `Manual nextmap set`);
//         }
//         else {
//             Logger.verbose('MapVoteExtended', 2, `next map list empty`);
//         }
//         // Logger.verbose('MapVoteExtended', 2, `Manual nextmap set`);
//     }

// };

// export default class MapVoteExtended extends LayersFractionsMixin(BasePlugin) {
export default class MapVoteExtended extends BasePlugin {
    static get description() {
        return 'The <code>MapVoteExtended</code> plugin allow to nominate and vote for next layer.';
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
            },
            voteMinNumb: {
                required: false,
                // default: 2,
                default: 1,
                description: 'Minimum number of votes for map'
            },
            voteAutoStart: {
                required: false,
                // default: 900,
                default: 0,
                description: 'Auto start map vote after match start in seconds (0 - disabled)'
            },
            voteRepeatBroadcast: {
                required: false,
                default: 55,
                description: 'Map vote broadcast info in seconds'
            },
            voteMapHistory: {
                required: false,
                default: 3,
                description: 'History list size of last maps to not use in next vote'
            },
            voteMapMaxHistory: {
                required: false,
                default: 8,
                description: 'Maximum number of saved history played maps'
            },
            voteMapGamemode: {
                required: false,
                default: 'RAAS',
                description: 'The type of gamemode taken for a random map vote'
            },
            nominationMaxNumb: {
                required: false,
                default: 2,
                description: 'Maximum number of nominations taken to vote'
            },
            nominateAutoStart: {
                required: false,
                default: 0,
                description: 'Auto start map nominating after match start in seconds (0 - disabled)'
            },
            mapBlacklist: {
                required: false,
                default: ['JensensRange_GB-MIL',
                'JensensRange_US-RUS',
                'JensensRange_USMC-MEA',
                'JensensRange_CAF-INS',
                'JensensRange_AUS-RUS'],
                description: 'Blacklisted maps layerIds'
            }
        };
    }

    constructor(server, options, connectors) {
        super(server, options, connectors);
        this.onChatMessage = this.onChatMessage.bind(this);
        this.onNewGame = this.onNewGame.bind(this);
        // this.manualNextMapList = null;
    }

    async mount() {
        this.server.on('NEW_GAME', this.onNewGame);
        this.server.on('CHAT_MESSAGE', this.onChatMessage);

        // this.manualNextMapList = null;
        // global.manualNextMapList = null;
        global.manualNextMapList = [];
        global.checkManualNextMapListNull = false;

        Logger.verbose('MapVoteExtended', 2, `---mount---`);
        console.log(`---mount---`);
        //
        //
        //
        // this.autoStartTimeout = setTimeout(() => {this.initMapVote(null);}, this.options.voteAutoStart * 1000);
        //
        //
        //
        // this.server.on(`CHAT_COMMAND:${this.options.command}`, this.onChatCommand);
    }

    async unmount() {
        this.server.removeEventListener('NEW_GAME', this.onNewGame);
        this.server.removeEventListener('CHAT_MESSAGE', this.onChatMessage);

        Logger.verbose('MapVoteExtended', 2, `---unmount---`);
        console.log(`---unmount---`);
        // this.server.removeEventListener(`CHAT_COMMAND:${this.optionsf.command}`, this.onChatCommand);
    }

    async onNewGame() {
        if (this.autoStartTimeout) clearTimeout(this.autoStartTimeout);
        if (this.nominateAutoStartTimeout) clearTimeout(this.nominateAutoStartTimeout);
        if (this.mapVoteTimeout) clearTimeout(this.mapVoteTimeout);
        if (this.repeatingBroadcastTimeout) clearTimeout(this.repeatingBroadcastTimeout);
        this.mapNominate = null;
        this.mapVote = null;
        this.mapVoteTimeout = null;
        this.repeatingBroadcastTimeout = null;
        if (this.options.voteAutoStart > 0) {
            Logger.verbose('MapVoteExtended', 2, `New game started, automatic vote map will start in ${this.options.voteAutoStart} seconds`);
            this.autoStartTimeout = setTimeout(() => {this.initMapVote(null);}, this.options.voteAutoStart * 1000);
        }
        if (this.options.nominateAutoStart > 0) {
            Logger.verbose('MapVoteExtended', 2, `New game started, automatic map nominating will start in ${this.options.nominateAutoStart} seconds`);
            this.nominateAutoStartTimeout = setTimeout(() => {this.initMapNominate(null);}, this.options.nominateAutoStart * 1000);
        }
        let newMap = await this.server.rcon.getCurrentMap();
        console.log(`aktualna mapa: `+newMap.layer);
        console.log(`aktualna mapa: `+JSON.stringify(newMap));
        // MapVoteExtended.writeMapHistoryFile(JSON.stringify(newMap.layer));
        // this.writeMapHistoryFile(JSON.stringify(newMap.layer).replace(/\\"/g,''));
        await this.writeMapHistoryFile(newMap.layer);
        // this.writeMapHistoryFile(newMap.l)
        // MapVoteExtended.writeMapHistoryFile(newMap.layer);
        // MapVoteExtended.writeMapHistoryFile(JSON.stringify(await this.server.rcon.getCurrentMap().layer));
        if (global.manualNextMapList != null && typeof global.manualNextMapList !== 'undefined' && global.manualNextMapList.length > 0) {
        // if (this.manualNextMapList != null && typeof this.manualNextMapList !== 'undefined' && this.manualNextMapList.length > 0) {
            await this.setNextMapFromList();
        }
    }

    async onChatMessage(info) {
        const admins = await this.server.getAdminsWithPermission('canseeadminchat');
        // if (info.message.match(/^!(rmapvote|rvote|rvotemap|randommapvote|randomvotemap|randmapvote|randvotemap|randvote|randomvote)/i)) this.initMapVote(info.player.steamID);
        if (this.mapVote && !this.mapVote.result) {
            const voteMessage = info.message.match(/^(!vote)?\s*([1-9]){1}$/m);
            if (voteMessage) {
                this.addVote(info.player.steamID, voteMessage[voteMessage.length - 1]);
            }
        }
        if (info.message.match(/^!(mstop)/i)) {
            // console.log(`---message: `+info.message);
            // var messageSplit = info.message.split(" ");
            // this.initMapNominate(info.player.steamID, this.checkLayerid(info.player.steamID, messageSplit.slice(1)));
            this.unmount();
        }
        if (info.message.match(/^!(mstart)/i)) {
            // console.log(`---message: `+info.message);
            // var messageSplit = info.message.split(" ");
            // this.initMapNominate(info.player.steamID, this.checkLayerid(info.player.steamID, messageSplit.slice(1)));
            this.mount();
        }
        if (info.message.match(/^!(layers|layer)/i)) this.getLayers(5);
        // if (info.message.match(/^!(startnominate|startrtv)/i)) this.initMapNominate(info.player.steamID);
        if (info.message.match(/^!(votereset)/i)) console.log(`---votereset`);

        if (info.message.match(/^!(nominate |n )/i)) {
            // console.log(`---message: `+info.message);
            var messageSplit = info.message.split(" ");
            // let checkResult = this.checkLayerid(info.player.steamID, messageSplit.slice(1));
            this.initMapNominate(info.player.steamID, this.checkLayerid(info.player.steamID, messageSplit.slice(1)));
            // this.initMapNominate(info.player.steamID, checkResult != [] ? );
        }
        // if (info.message.match(/^!(n)/i)) {
        //     console.log(`---nominate: `+info.message);
        //     var messageSplit = info.message.split(" ");
        //     this.initMapNominate(info.player.steamID, this.checkLayerid(info.player.steamID, messageSplit.slice(1)));
        // }
        if (info.message.match(/^!(listadmins)/i)) {
            // const admins = await this.server.getAdminsWithPermission('canseeadminchat');
            if (admins.includes(info.player.steamID)) {
                console.log(`admins: `+admins);
                // var admintest = await this.server.getPlayerBySteamID(admins, true);
                // console.log(`admins: ${this.admintest}`);
            }
        }
        if (info.message.match(/^!(rtv|startmapvote)/i)) {
            // const admins = await this.server.getAdminsWithPermission('canseeadminchat');
            if (admins.includes(info.player.steamID)) {
                var messageSplit = info.message.split(" ");
                let checkResult = await this.checkLayerid(info.player.steamID, messageSplit.slice(1));
                // console.log(messageSplit.length);
                // console.log(checkResult.length);
                if (messageSplit.length - 1 === checkResult.length) {
                    console.log(`checkResult before rtv:`);
                    console.log(checkResult);
                    // this.initMapVote(info.player.steamID, this.checkLayerid(info.player.steamID, messageSplit.slice(1)));
                    this.initMapVote(info.player.steamID, checkResult != [] ? checkResult : false );
                }
                else {
                    await this.server.rcon.warn(info.player.steamID, 'Fix LayerId and try again');
                }
            }
            else {
                await this.server.rcon.warn(info.player.steamID, 'Only admin can start voting');
            }

        }
        if (info.message.match(/^!(maphistory|listhistory)/i)) {
            // const admins = await this.server.getAdminsWithPermission('canseeadminchat');
            if (admins.includes(info.player.steamID)) {
                let test = await this.readMapHistoryFile();
                console.log(`mapHistory: `+test+'time: '+new Date().toJSON());
                console.log('`test`');
                // const testowo2 = await this.server.rcon.getCurrentMap().toJSON;
                // console.log(`aktualna mapa: `+testowo2);
                console.log(new Date().toJSON());
                console.log('`test`');
                let mapHist = await this.readMapHistoryFile();
                var messageSplit = info.message.split(" ");
                // for (var i = 0; i < (messageSplit.slice(1) || mapHist.length); i++) {
                for (var i = 0; i < (!isNaN(parseFloat(messageSplit.slice(1))) && !isNaN(messageSplit.slice(1) - 0) ? messageSplit.slice(1) : mapHist.length); i++) {
                    // await this.server.rcon.warn(info.player.steamID, JSON.stringify(mapHist[i]["layer"]+mapHist[i]["date"]).replace('/\\"'|'"\\',' '));
                    // await this.server.rcon.warn(info.player.steamID, JSON.stringify(mapHist[i]["layer"]+mapHist[i]["date"]).replace(/\//g,' '));
                    // await this.server.rcon.warn(info.player.steamID, JSON.stringify(mapHist[i]["layer"]+mapHist[i]["date"]).replace(/\\"/g,' - '));
                    await this.server.rcon.warn(info.player.steamID, JSON.stringify(mapHist[i]["layer"]+" -> "+mapHist[i]["date"]));
                    // await this.server.rcon.warn(info.player.steamID, JSON.stringify(mapHist[i]["layer"]).replace('\\',' ')+JSON.stringify(mapHist[i]["date"].replace('\\',' ')));
                }
                // await this.server.rcon.warn(info.player.steamID, JSON.stringify(await this.readMapHistoryFile()));
            }
            else {
                await this.server.rcon.warn(info.player.steamID, 'Only admin can list played maps');
            }
        }
        if (info.message.match(/^!(nextmaps|nextMaps)/i)) {
            // const admins = await this.server.getAdminsWithPermission('canseeadminchat');
            if (admins.includes(info.player.steamID)) {
                Logger.verbose('MapVoteExtended', 2, `nextmaps cmd used by admin ${info.player.name} `);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                // // let checkManualNextMapListNull = false;
                // let checkManualNextMapListNull;
                console.log(`################################## !nextmaps call ##################################`);
                // console.log(`test checkManualNextMapListNull value: `+ checkManualNextMapListNull);
                console.log(`test checkManualNextMapListNull value: `+ global.checkManualNextMapListNull);
                // console.log(`manualNextMapList value: `+this.manualNextMapList);
                console.log(`manualNextMapList value: `+global.manualNextMapList);

                // if (await this.manualNextMapList == null) {
                // if (this.manualNextMapList === null || this.manualNextMapList === undefined || this.manualNextMapList.length == 0) {
                // if (!Array.isArray(this.manualNextMapList) || !this.manualNextMapList.length === 0) {
                // if (Array.isArray(this.manualNextMapList) && this.manualNextMapList.length) {
                //
                //
                // if (typeof this.manualNextMapList === undefined && this.manualNextMapList == null) {
                if (global.manualNextMapList != null && typeof global.manualNextMapList !== 'undefined' && global.manualNextMapList.length > 0) {
                // if (this.manualNextMapList != null && typeof this.manualNextMapList !== 'undefined' && this.manualNextMapList.length > 0) {
                    // checkManualNextMapListNull = false;
                    // console.log(`test 1if: `+checkManualNextMapListNull);
                    global.checkManualNextMapListNull = false;
                    console.log(`test 1if: `+global.checkManualNextMapListNull);
                } else if (global.manualNextMapList != null && typeof global.manualNextMapList !== 'undefined' && global.manualNextMapList.length == 0) {
                // } else if (this.manualNextMapList != null && typeof this.manualNextMapList !== 'undefined' && this.manualNextMapList.length == 0) {
                    // checkManualNextMapListNull = false;
                    // console.log(`test 2if: `+checkManualNextMapListNull);
                    global.checkManualNextMapListNull = false;
                    console.log(`test 2if: `+global.checkManualNextMapListNull);
                } else {
                    // checkManualNextMapListNull = true;
                    // console.log(`test ifelse: `+checkManualNextMapListNull);
                    global.checkManualNextMapListNull = true;
                    console.log(`test ifelse: `+global.checkManualNextMapListNull);
                }
                // console.log(`test after if: `+checkManualNextMapListNull);
                console.log(`test after if: `+global.checkManualNextMapListNull);
                var messageSplit = info.message.split(" ");
                let checkedNextMapList = await this.checkLayerid(info.player.steamID, messageSplit.slice(1));
                if (messageSplit.length > 1 && messageSplit.length - 1 === checkedNextMapList.length) {
                    Logger.verbose('MapVoteExtended', 3, `checkedNextMapList: ${checkedNextMapList} `);
                    console.log(`before`);
                    // console.log(checkManualNextMapListNull);
                    console.log(global.checkManualNextMapListNull);
                    // if (checkManualNextMapListNull === true) {
                    if (global.checkManualNextMapListNull === true) {
                        Logger.verbose('MapVoteExtended', 2, `Nextmap list was null, init empty list`);
                        global.manualNextMapList = [];
                        // this.manualNextMapList = [];
                    }
                    console.log(`after`);

                    await this.setManualNextMapList(checkedNextMapList);
                    // if (checkManualNextMapListNull === true) {
                    if (global.checkManualNextMapListNull === true) {
                        Logger.verbose('MapVoteExtended', 2, `Nextmap list was null, setting new nextmap from list: ${checkedNextMapList} `);
                        await this.setNextMapFromList();
                    }
                    Logger.verbose('MapVoteExtended', 2, `Nextmap list updated`);
                    await this.server.rcon.warn(info.player.steamID, 'Next map list updated');
                }
                else {
                    await this.server.rcon.warn(info.player.steamID, 'Fix LayerId and try again');
                }
            }
            else {
                Logger.verbose('MapVoteExtended', 2, `Player ${info.player.name} is trying to set nextmap list`);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                await this.server.rcon.warn(info.player.steamID, 'Command available only for admin');
            }
        }
        if (info.message.match(/^!(clearnextmaps|clearNextMaps)/i)) {
            if (admins.includes(info.player.steamID)) {
                Logger.verbose('MapVoteExtended', 2, `clearnextmaps cmd used by admin ${info.player.name} `);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                global.manualNextMapList = [];
                // this.manualNextMapList = null;
                // // this.manualNextMapList = [];
                await this.server.rcon.warn(info.player.steamID, 'Next map list cleared');
            }
            else {
                Logger.verbose('MapVoteExtended', 2, `Player ${info.player.name} is trying to clear nextmap list`);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                await this.server.rcon.warn(info.player.steamID, 'Command available only for admin');
            }
        }
        if (info.message.match(/^!(skipnext|skipNext)/i)) {
            if (admins.includes(info.player.steamID)) {
                Logger.verbose('MapVoteExtended', 2, `skipnext cmd used by admin ${info.player.name} `);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                await this.setNextMapFromList();
                await this.server.rcon.warn(info.player.steamID, 'Next map skipped');

            }
            else {
                Logger.verbose('MapVoteExtended', 2, `Player ${info.player.name} is trying to skip nextmap`);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                await this.server.rcon.warn(info.player.steamID, 'Command available only for admin');
            }
        }
        if (info.message.match(/^!(listnextmaps|nextmapslist|listNextMaps|nextMapsList)/i)) {
            if (admins.includes(info.player.steamID)) {
                Logger.verbose('MapVoteExtended', 2, `NextMaps listed by ${info.player.name} `);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                if (global.manualNextMapList != null) {
                // if (this.manualNextMapList != null) {
                //     // Logger.verbose('MapVoteExtended', 2, `manualNextMapList = ${this.manualNextMapList} `);
                //     // let nextMapMessage = "";
                //     // for (var i = 0; i < this.manualNextMapList.length; i++) {
                //     //     nextMapMessage += this.manualNextMapList[i]+'\n';
                //     // }
                //     // await this.server.rcon.warn(info.player.steamID, 'Next map list:\n'+nextMapMessage);
                    this.listNextMaps(info.player.steamID, global.manualNextMapList);
                    console.log(`nextmapsdebug1 `+global.manualNextMapList);
                    // this.listNextMaps(info.player.steamID, this.manualNextMapList);
                    // console.log(`nextmapsdebug1 `+this.manualNextMapList);
                }
                else {
                    Logger.verbose('MapVoteExtended', 2, `Next map list is empty`);
                    await this.server.rcon.warn(info.player.steamID, 'Next map list is empty');
                    console.log(`nextmapsdebug2 `+global.manualNextMapList);
                    // console.log(`nextmapsdebug2 `+this.manualNextMapList);
                }
            }
            else{
                Logger.verbose('MapVoteExtended', 2, `Player ${info.player.name} is trying to list nextmaps `);
                Logger.verbose('MapVoteExtended', 3, `SteamID: ${info.player.steamID} `);
                await this.server.rcon.warn(info.player.steamID, 'Command available only for admin');
            }
        }
        if (info.message.match(/^!(broadcastnextmap)/i)) {
            if (admins.includes(info.player.steamID)) {
                await this.server.rcon.broadcast(`test5 ${(await this.server.rcon.getNextMap())[0]}  ${await this.getLayersFractions([await global.manualNextMapList[0]])}`);
                // await this.server.rcon.broadcast(`test5 ${(await this.server.rcon.getNextMap())[0]}  ${await this.getLayersFractions([await this.manualNextMapList[0]])}`);
                console.log(`broadcast1`);
                console.log(`${await this.getLayersFractions([await global.manualNextMapList[0]])}`);
                // console.log(`${await this.getLayersFractions([await this.manualNextMapList[0]])}`);
                const duddd = await this.getLayersFractions(["BlackCoast_RAAS_v1","BlackCoast_RAAS_v2"]);
                const nexmap = await this.server.rcon.getNextMap();
                const nexmap2 = await Layers.getLayerByName(nexmap.layer);
                const duddd2 = await this.getLayersFractions(this.server.rcon.getNextMap());
                console.log(duddd);
                console.log(`tescik ` + nexmap, nexmap2);
                console.log(await this.getLayersFractions(nexmap2.layerid));
                console.log(duddd2);
                console.log(`broadcast2`);
            }
        }

        if (info.message.match(/^!(test)/i)) {
            // const admins = await this.server.getAdminsWithPermission('canseeadminchat');
            if (admins.includes(info.player.steamID)) {
                let test = await this.readMapHistoryFile();
                console.log(`mapHistory: `+test+'time: '+new Date().toJSON());
                console.log('`test`');
                // const testowo2 = await this.server.rcon.getCurrentMap().toJSON;
                // console.log(`aktualna mapa: `+testowo2);
                console.log(new Date().toJSON());
                console.log('`test-write`');
                let newMap = await this.server.rcon.getCurrentMap();
                console.log('`-+-2`'+newMap.layer);
                // this.writeMapHistoryFile(newMap.layer);

                // for (var i = 0; i < (messageSplit.slice(1) || mapHist.length); i++) {
                // await this.server.rcon.warn(info.player.steamID, JSON.stringify(await this.readMapHistoryFile()));

                // let raas = await this.getLayerByGamemode('RAAS');
                // let aas = await this.getLayerByGamemode('AAS');
                // let tc = await this.getLayerByGamemode('TC');
                // let invasion = await this.getLayerByGamemode('Invasion');
                // console.log(`Layers RAAS`)
                // console.log(await JSON.stringify(raas));
                // console.log(`Layers AAS`)
                // console.log(await JSON.stringify(aas));
                // console.log(`Layers TC`)
                // console.log(await JSON.stringify(tc));
                // console.log(`Layers Invasion`)
                // console.log(await JSON.stringify(invasion));

                // this.server.rcon.execute(`ChatToAdmin |HSR| Seth test`);
                // this.server.rcon.execute(`[ChatAdmin] [SteamID:76561197989449645] |HSR| Seth : !fffff`);
                // this.server.rcon.execute(`ChatToAdmin [SteamID:76561197989449645] |HSR| Seth : !fffff`);
                // this.server.rcon.execute(`ChatToAdmin |HSR| Seth : !fffff`);
                // this.server.rcon.execute(`ChatToAll |HSR| Seth test`);
                // [ChatAdmin] [SteamID:76561197989449645] |HSR| Seth: testttfffff
                await this.server.rcon.execute(`[ChatAdmin] [SteamID:76561197989449645] |HSR| Seth: testttfffff`);
                await this.server.rcon.adminChat(info.player.steamID, 'test');
                // [ChatAdmin] [SteamID:76561198016008702] [MIG] EOC LongBarrel: This is admin chat



            }
            else {
                await this.server.rcon.warn(info.player.steamID, 'Only admin can list played maps');
            }
        }
        // }
        // if (info.message.match(/^!(startmapvote|startvotemap|svotemap)/i)) this.getLayers(5);
    }

    async initMapVote(steamID, layersIds) {
        if (this.mapVote) {
            if (this.mapVote.result && steamID) {
              await this.server.rcon.warn(steamID, `Vote already finished! Result was: ${this.mapVote.result}`);
              return;
            }
            if (steamID) {
              await this.server.rcon.warn(steamID, 'Vote in progress! Check broadcasts for details');
              return;
            }
        }

        await this.finishMapNominate();
        // // const arr = layersIds;
        // // const upper = arr.map(element => {
        // //     return element.toUpperCase();
        // //   });
        // // console.log(`UPPERCASE: `+upper);
        // const upper = [];
        // const test = [];
        // console.log(`isArray: `+Array.isArray(layersIds));
        // console.log(typeof await layersIds);
        // test.push(layersIds);
        // test.forEach(element => { upper.push(element.toUpperCase());});
        // console.log(`UPPERCASE: `+upper);

        if (this.autoStartTimeout) clearTimeout(this.autoStartTimeout);
        const layersList = await this.getLayers(5, layersIds);
        const fractionsList = await this.getLayersFractions(layersList);
        Logger.verbose('MapVoteExtended', 1, `Starting map vote with layers: ${layersList}`);
        this.mapVote = {
            layers: layersList,
            fractions: fractionsList,
            votes: {},
            result: null
        };

        this.mapVoteTimeout = setTimeout(() => {this.finishMapVote();}, this.options.voteDuration * 1000);
        Logger.verbose('MapVoteExtended', 1, `Set map vote timeout, value: ${this.mapVoteTimeout} `);

        this.repeatingBroadcast();
    }

    async initMapNominate(steamID, layersId) {
        if (this.mapVote) {
            if (this.mapVote.result && steamID) {
              await this.server.rcon.warn(steamID, `Vote already finished! Result was: ${this.mapVote.result}`);
              return;
            }
            if (steamID) {
              await this.server.rcon.warn(steamID, 'Vote in progress! You can\'t nominate now!');
              return;
            }
        }
        if (this.mapNominate){
            if (this.mapNominate.result.length>0) {
                await this.server.rcon.warn(steamID, `Nominating already finished!`);
                return;
            }
        }

        if (this.mapNominate == null) {
            // this.mapNominate = {
            //     layers: ["BlackCoast_RAAS_v1","BlackCoast_RAAS_v4","BlackCoast_RAAS_v3"],
            //     votes: {"76561197989449645":"BlackCoast_RAAS_v4","76561197989449641":"BlackCoast_RAAS_v1","76561197989449642":"BlackCoast_RAAS_v1","76561197989449643":"BlackCoast_RAAS_v1","76561197989449644":"BlackCoast_RAAS_v3","76561197989449615":"BlackCoast_RAAS_v3"},
            //     result: []
            // }
            this.mapNominate = {
                layers: [],
                votes: {},
                result: []
            }
        }
        console.log(`MapNominate: `+JSON.stringify(await this.mapNominate));
        await this.addNominate(await steamID, await layersId);
        console.log(`MapNominate2: `+JSON.stringify(await this.mapNominate));
    }

    async repeatingBroadcast() {
        this.voteBroadcast();
        this.repeatingBroadcastTimeout = setTimeout(() => {this.repeatingBroadcast();}, this.options.voteRepeatBroadcast * 1000);
    }

    async voteBroadcast() {
        if (!this.mapVote) return;
        // console.log(`---messagedbg: `+JSON.stringify(this.mapVote));

        const layersMessage = this.mapVote.layers.map((layerName, index) => `[${index + 1}] - ${layerName} ${this.mapVote.fractions[index]}`).join('\n');
        const layerMessageSplite = layersMessage.split('\n');

        if (await layerMessageSplite.length > 5) {

            await this.server.rcon.broadcast(`MAPVOTE! Type number in chat to vote:\n${layerMessageSplite.slice(0,5).join('\n')}`);
            await this.server.rcon.broadcast(`${layerMessageSplite.slice(5,9).join('\n')}`);
        }
        else {
            await this.server.rcon.broadcast(`MAPVOTE! Type number in chat to vote:\n${layersMessage}`);
        }

        ////await this.server.random.execute(`ChatToAll MAPVOTE! Type number in chat to vote:\n${layersMessage}`)
        // for (const player of this.server.players) {
        //     await this.server.rcon.warn(player.steamID, `MAPVOTE! Type number in chat to vote:\n${layersMessage}`);
        // }
    }

    async finishMapVote() {
        if (this.mapVoteTimeout) clearTimeout(this.mapVoteTimeout);
        if (this.repeatingBroadcastTimeout) clearTimeout(this.repeatingBroadcastTimeout);
        if (!this.mapVote) return;

        const sortedResult = await this.getVoteResult();

        if (sortedResult[0].votes >= this.options.voteMinNumb) {
            this.mapVote.result = sortedResult[0].layer;
            this.voteBroadcastResult(sortedResult);
            this.server.rcon.execute(`AdminSetNextLayer ${this.mapVote.result}`);
        }
        else {
            this.server.rcon.broadcast(`None of the maps got ${this.options.voteMinNumb} votes, the map was not selected`);
            this.mapVote = null;
        }
    }

    async finishMapNominate() {
        if (!this.mapNominate) return;

        const sortedNomination = await this.getNominateResult();
        console.log(`MapNominate3: `+JSON.stringify(sortedNomination));
        for (var i = 0; i < Math.min(await this.options.nominationMaxNumb, sortedNomination.filter(obj => { if (obj.votes > 0) {return true;} return false;}).length); i++) {
            this.mapNominate.result.push(sortedNomination[i].layer);
        }
        console.log(`MapNominate4: `+JSON.stringify(await this.mapNominate.result));



    }

    async getVoteResult() {
        const result = {};

        this.mapVote.layers.forEach((layerName) => {result[layerName] = 0;});
        Object.keys(this.mapVote.votes).forEach((id) => {result[this.mapVote.votes[id]] += 1;});
        return Object.keys(result).map((layerName) => {return {layer: layerName, votes: result[layerName]};}).sort(function (a, b) {return b.votes - a.votes;});
    }

    async getNominateResult() {
        const nominate = {};

        this.mapNominate.layers.forEach((layerName) => {nominate[layerName] = 0;});
        Object.keys(this.mapNominate.votes).forEach((id) => {nominate[this.mapNominate.votes[id]] += 1;});
        return Object.keys(nominate).map((layerName) => {return {layer: layerName, votes: nominate[layerName]};}).sort(function (a, b) {return b.votes - a.votes;});
    }

    async getLayers(count, layersIds) {
        const currentMap = await this.server.rcon.getCurrentMap();
        const test = await Layers.getLayerByName(currentMap.layer);
        const allLayersByGamemode = await this.getLayerByGamemode(this.options.voteMapGamemode);
        const test3 = Layers.layers.map(layer => layer.layerid);
        // console.log(`test3: `+test3);
        // console.log(`test1: `+JSON.stringify(test['layerid']));
        const test4 = Layers.getLayers;

        Array.prototype.substract = function(a) {
            return this.filter(function(i) {return a.indexOf(i) < 0;});
        }
        Array.prototype.unique = function() {
            var a = this.concat();
            for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                    if(a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
        };
        console.log(`MapNominate5.1: `);
        console.log(`MapNominate5.1: `+Array.isArray(this.mapNominate));
        console.log(`MapNominate5.1: `+typeof this.mapNominate);
        console.log(`MapNominate5.1: `+JSON.stringify(this.mapNominate));
        // console.log(`MapNominate5.1: `+this.mapNominate.result.length);

        var selectedLayers = [];
        if ( Array.isArray(this.mapNominate) && this.mapNominate.result.length > 0) {
        // if (this.mapNominate.result.length > 0) {
            console.log(`MapNominate6: `+JSON.stringify(await selectedLayers));
            console.log(`MapNominate6: `+JSON.stringify(await layersIds));
            selectedLayers = selectedLayers.concat(await layersIds||[], this.mapNominate.result||[]).unique();
            console.log(`MapNominate6: `+JSON.stringify(await selectedLayers));
        }
        else {
            selectedLayers = selectedLayers.concat(await layersIds||[]).unique();
        }

        var mapBlacklist = [];
        // mapBlacklist.push('Chora_Invasion_v2');
        var mapHistory = [];
        mapHistory.push('Chora_Invasion_v2');
        mapHistory.push('Anvil_Invasion_v2');
        mapHistory.push('AlBasrah_AAS_v3');

        // const fs = require('fs');

        // let mapHistoryData = JSON.stringify(mapHistory);
        let mapHistoryData = [];
        mapHistoryData = await this.readMapHistoryFile();
        // mapHistoryData = JSON.stringify(await mapHistoryData);
        // mapHistoryData = await mapHistoryData;
        // mapHistoryData = await mapHistoryData['layer'];
        mapHistoryData = mapHistoryData.map( (item) => item.layer);
        Logger.verbose('MapVoteExtended', 2, `--- ${JSON.stringify(await mapHistoryData)} `);
        // Logger.verbose('MapVoteExtended', 2, `--- ${await mapHistoryData} `);

        // MapVoteExtended.writeMapHistoryFile(JSON.stringify(mapHistory, null, 1));

        mapHistory.push('AlBasrah_AAS_v1');
        console.log("typeof:"+ typeof(mapHistory));
        console.log("typeof:"+ mapHistory);
        var JsonObject = JSON.stringify(mapHistory);
        console.log("typeof2:"+ typeof(JsonObject));
        console.log("typeof2:"+ JsonObject);
        // MapVoteExtended.writeMapHistoryFile(JSON.stringify(mapHistory, null, 1));
        // MapVoteExtended.writeMapHistoryFile(JSON.parse(JSON.stringify(mapHistory)));

        // fs.writeFileSync('mapHistory.json', mapHistoryData);
        // this.writeMapHistoryFile(mapHistoryData);

        var layerSubstract = [];
        var mapHistorytest1 = [];
        // mapHistorytest1.push('Chora_Invasion_v2');
        // mapHistorytest1.push('AlBasrah_AAS_v3');
        var mapHistorytest2 = [];
        // mapHistorytest2.push('AlBasrah_Insurgency_v1');
        // layerSubstract = layerSubstract.concat(mapBlacklist, mapHistory, mapHistorytest1, mapHistorytest2).unique();
        layerSubstract = layerSubstract.concat(mapBlacklist, mapHistoryData.slice(0,this.options.voteMapHistory)).unique();

        selectedLayers = await selectedLayers.substract(layerSubstract);

        count = count - await selectedLayers.length;

        var dupa = [];
        var randomLayers = [];

        if ( count > 0) {
            console.log("allLayersCount: "+ allLayersByGamemode.length);
            console.log("allLayers: "+ allLayersByGamemode);
            console.log("layerSubstractCount: "+ layerSubstract.length);
            console.log("layerSubstract: "+ layerSubstract);
            console.log("allLayersCount: "+ allLayersByGamemode.substract(layerSubstract).length);
            console.log("allLayers: "+ allLayersByGamemode.substract(layerSubstract));
            randomLayers = await allLayersByGamemode.sort(() => 0.5 - Math.random()).slice(0, count);
        }

        var dupa = selectedLayers.concat(randomLayers).unique();

        return dupa
    }

    async addVote(steamID, vote) {
        this.mapVote.votes[steamID] = this.mapVote.layers[parseInt(vote) - 1];
        await this.server.rcon.warn(steamID, `Voted on: ${this.mapVote.votes[steamID]}`);
    }

    async addNominate(steamID, nominate) {
        if (!this.mapNominate.layers.includes(nominate[0])) {
            this.mapNominate.layers.push(await nominate[0]);
        }
        this.mapNominate.votes[await steamID] = nominate[0];
        await this.server.rcon.warn(steamID, `Layer ${this.mapNominate.votes[steamID]} nominated`);
    }

    async voteBroadcastResult(result) {
        const resultTable = result.map((el) => `${el.layer} - ${el.votes} vote/s`).join('\n');
        await this.server.rcon.broadcast(`Voting finished, results: \n${resultTable}\n\nSetting next map to: ${this.mapVote.result}`);
    }

    async getLayerByGamemode(gamemode) {
        await Layers.pull();
        var result = [];

        const matches = Layers.layers.filter(layer => layer.gamemode.includes(gamemode));
        if (matches.length >= 1) {
          for (var i = 0; i < matches.length; i++){
            result[i] = matches[i].layerid
          }
          return result;
        }

        return null;
    }

    async checkLayerid(steamID, layerId) {
        console.log('checkLayerid:', steamID, layerId);
        await Layers.pull();

        var customLayersId = [
            'Manicouagan_RAAS_v8',
            'Manicouagan_RAAS_v9',
            'GooseBay_Seed_v1',
            'Mutaha_Tanks_v1',
            'BlackCoast_RAAS_v5',
            'BlackCoast_Invasion_v5',
            'Manicouagan_RAAS_v10',
            'Manicouagan_RAAS_v11',
            'Manicouagan_RAAS_v12',
            'Manicouagan_RAAS_v13',
            'Manicouagan_RAAS_v14',
            'Manicouagan_RAAS_v15',
            'Manicouagan_Invasion_v8',
            'Manicouagan_Invasion_v9',
            'Manicouagan_AAS_v5',
            'Narva_RAAS_v7',
            'PacificProvingGrounds_Seed_v1',
            'PacificProvingGrounds_AAS_v1',
            'PacificProvingGrounds_AAS_v2',
            'Yehorivka_Invasion_v1',
            'AlBasrah_Invasion_v9',
            'Anvil_RAAS_v5',
            'BlackCoast_RAAS_v6',
            'BlackCoast_Seed_v2',
            'BlackCoast_Invasion_v6',
            'Chora_AAS_v7',
            'Fallujah_Invasion_v7',
            'Fallujah_RAAS_v8',
            'Fallujah_Seed_v2',
            'Gorodok_Invasion_v4',
            'Gorodok_RAAS_v13',
            'Kohat_Invasion_v4',
            'Kohat_RAAS_v5',
            'Kohat_RAAS_v11',
            'Lashkar_Invasion_v5',
            'Logar_AAS_v4',
            'Mutaha_Invasion_v5',
            'Mutaha_RAAS_v8',
            'Sumari_RAAS_v3',
            'Sumari_Seed_v4',
            'Tallil_Invasion_v6',
            'Tallil_RAAS_v9',
            'Yehorivka_Invasion_v5',
            'Yehorivka_RAAS_v15'
        ]

        var checked = [];
        for (var i = 0; i < layerId.length; i++) {

            let exist = Layers.layers.filter(layer => layer.layerid.includes(layerId[i]));
            if (exist.length === 0) {
                console.log(`---checkLayerCustom: `+JSON.stringify(layerId[i]));
                exist = customLayersId.filter(layer => layer.includes(layerId[i]));
            }

            ///
            // console.log(`---checkLayerCustom: `+JSON.stringify(Layers.layers.layerId));
            ///
            if (exist.length === 1) {
                checked.push(layerId[i]);
            }
            else {
                await this.server.rcon.warn(steamID, `There is no layer with name: '${layerId[i]}'`);
                // return [];
            }
        }
        return checked;
    }

    async getLayersFractions(layersId, longDisplayType) {
        await Layers.pull();

        var fractions = [];
        if (longDisplayType === true) {
            for (var i = 0; i < layersId.length; i++) {
                const exist = Layers.layers.filter(layer => layer.layerid.includes(layersId[i]));
                if (exist.length === 1) {
                    fractions.push(`(`+exist[0].teams[0].faction+` vs `+exist[0].teams[1].faction+`)`);
                }
            }
        }
        else {
            //change it later to first letter from name
            // // fix names
            var fractionsShort = {
                // 'Australian Defence Force': 'AUS',
                'Australian Defence Force': 'ADF',
                'British Army': 'GB',
                'British Army': 'BAF',
                'British Armed Forces': 'BAF',
                'Canadian Army': 'CAF',
                'Canadian Armed Forces': 'CAF',
                // 'Irregular Militia Forces': 'MIL',
                'Irregular Militia Forces': 'IMF',
                'Insurgent Forces': 'INS',
                'Middle Eastern Alliance': 'MEA',
                // 'Russian Ground Forces': 'RUS',
                'Russian Ground Forces': 'RGF',
                'Russian Airborne Forces': 'RAF',
                'United States Army': 'USA',
                'United States Marine Corps': 'USMC',
                'People\'s Liberation Army': 'PLA',
                'Turkish Land Forces': 'TLF'
            }
            for (var i = 0; i < layersId.length; i++) {
                const exist = Layers.layers.filter(layer => layer.layerid.includes(layersId[i]));
                if (exist.length === 1) {

                    // console.log(`---message2: `+JSON.stringify(exist[0].teams[0].faction));
                    // console.log(`---message2: `+JSON.stringify(exist[0].teams[1].faction));
                    fractions.push(`(`+fractionsShort[exist[0].teams[0].faction]+` vs `+fractionsShort[exist[0].teams[1].faction]+`)`);
                }
            }
        }
        return fractions;
    }

    async readMapHistoryFile(returnCount) {
        let filePath = path.resolve(__dirname, '../', './mapHistory.json');
        // if (!fs.existsSync(filePath)) throw new Error('mapHistory.json file does not exist.');
        if (!fs.existsSync(filePath)) return;
        // let data = JSON.parse(fs.readFileSync(filePath,'utf-8'));
        let data = [];
        try {
            data = await JSON.parse(fs.readFileSync(filePath));
        }
        catch(e) {
            // forget about it :)
        }
        // let data = JSON.parse(fs.readFileSync(filePath));
        console.log(`readMapHistoryFile data: `+JSON.stringify(data));
        console.log(`readMapHistoryFile data: `+JSON.stringify(data[0]["layer"]+data[0]["date"]));
        // return fs.readFileSync(filePath, 'utf8');
        return data.slice(0, returnCount);
    }

    async writeMapHistoryFile(data) {
        // filePath = path.resolve(__dirname, '../', filePath);
        let filePath = path.resolve(__dirname, '../', './mapHistory.json');
        // return fs.writeFileSync(filePath, data);
        // fs.writeFileSync('mapHistory.json', data);
        let dataMaps = [];
        // dataMaps = Array.from(await this.readMapHistoryFile());
        console.log(`aktualna historia: `+JSON.stringify(dataMaps));
        console.log(`aktualna data2: `+JSON.stringify(await Layers.getLayerByName(data).layerId));
        // let dataMaps = (data + new Date().toJSON());
        // dataMaps.push({"history": [{"layer": data, "date": new Date().toJSON()}]});
        let writeMap = await Layers.getLayerByName(data);
        dataMaps.push({"layer": writeMap['layerid'], "date": new Date().toJSON()});
        // let readHistory = JSON.parse(this.readMapHistoryFile());
        let readHistory = await this.readMapHistoryFile(this.options.voteMapMaxHistory - 1);
        // dataMaps.push(await this.readMapHistoryFile());
        console.log(`wczytana historia: `+JSON.stringify(readHistory));
        if (JSON.stringify(readHistory) !== '[]') {
            dataMaps.push.apply(dataMaps, readHistory);
        }
        console.log(`aktualna historia map: `+JSON.stringify(dataMaps));
        fs.writeFileSync(filePath, JSON.stringify(dataMaps, null, 2));
    }

    async setManualNextMapList(layersIds) {
        global.manualNextMapList.push(...layersIds);
        // this.manualNextMapList.push(...layersIds);
        Logger.verbose('MapVoteExtended', 2, `Manual nextmap list set`);
        Logger.verbose('MapVoteExtended', 3, `manual next map list: ${JSON.stringify(global.manualNextMapList)}`);
        // Logger.verbose('MapVoteExtended', 3, `manual next map list: ${JSON.stringify(this.manualNextMapList)}`);
    }

    async setNextMapFromList() {
        let NextMapList = global.manualNextMapList;
        // let NextMapList = this.manualNextMapList;
        Logger.verbose('MapVoteExtended', 3, `set next map from list: ${JSON.stringify(NextMapList)}`);
        let manualNextMap = NextMapList.shift();
        Logger.verbose('MapVoteExtended', 3, `set next map: ${JSON.stringify(manualNextMap)}`);
        this.server.rcon.execute(`AdminSetNextLayer ${manualNextMap}`);
        if (JSON.stringify(NextMapList) !== '[]') {
            // await this.setManualNextMapList(await NextMapList);
            Logger.verbose('MapVoteExtended', 2, `Manual nextmap set`);
        }
        else {
            Logger.verbose('MapVoteExtended', 2, `next map list empty`);
        }
        // Logger.verbose('MapVoteExtended', 2, `Manual nextmap set`);
    }

    // async setNextMapFromList() { //to stare, nie działa
    //     Logger.verbose('MapVoteExtended', 3, `set next map from list: ${JSON.stringify(this.manualNextMapList)}`);
    //     let manualNextMap = this.manualNextMapList.shift();
    //     Logger.verbose('MapVoteExtended', 3, `set next map: ${JSON.stringify(manualNextMap)}`);
    //     this.server.rcon.execute(`AdminSetNextLayer ${manualNextMap}`);
    //     if (JSON.stringify())
    // }

    async listNextMaps(steamID, nextMapsList) {
        Logger.verbose('MapVoteExtended', 2, `manualNextMapList = ${global.manualNextMapList} `);
        // Logger.verbose('MapVoteExtended', 2, `manualNextMapList = ${this.manualNextMapList} `);
        // // const warn(steamID, nextMapMessage) = this.server.rcon.warn(steamID, nextMapMessage);
        let nextMapMessage = "Next map list:\n";
        console.log(`###listNextMaps for before `)
        for (let i = 0; i < nextMapsList.length; i++) {
            // nextMapMessage += this.manualNextMapList[i]+'\n';
            console.log(`###listNextMaps if before `)
            if (i % 10 === 0 && i > 0) {
                console.log(`###listNextMaps if inside `)
                await this.server.rcon.warn(steamID, nextMapMessage);
                // await warn(steamID, nextMapMessage);
                await console.log(`await this.server.rcon.warn(`+steamID+`, `+nextMapMessage+`);`);
                nextMapMessage = "";
                console.log(`###listNextMaps if inside end`);
            }
            console.log(`###listNextMaps if after `)
            nextMapMessage += (i + 1) + ". "+nextMapsList[i]+"\n";
            console.log(`###listNextMaps for end `+nextMapMessage)
        }
        console.log(`###listNextMaps out for `)
        // setTimeout(() => {  console.log("World!"); }, 5000);
        // setTimeout(() => { this.server.rcon.warn(steamID, nextMapMessage); }, 1000);
        await this.server.rcon.warn(steamID, nextMapMessage);
        await console.log(`await this.server.rcon.warn(`+steamID+`, `+nextMapMessage+`);`);
        console.log(`###listNextMaps end `+nextMapMessage)
    }

    // static async getMapList() {
    //     return  this.manualNextMapList;
    // }



}

// module.exports = MapVoteExtended;

// to do
// !switch and admin aprv
// !seed to change map
// on/off settings live
// map like/dislike
// mapBlacklist from file
// admins get info about joining players (bans/notes)