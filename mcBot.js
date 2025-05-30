require('dotenv').config();
const { sendLogToDiscord, sendMsgToDiscord, addToMSGQueue} = require("./discordBot");
const mineflayer = require("mineflayer");
const {returnSBStats} = require("./statFunctions/returnSBStats.js");
const {returnBWStats} = require("./statFunctions/returnBWStats.js");
const {returnSWStats} = require("./statFunctions/returnSWStats.js");
const {returnPlayerInfo} = require("./statFunctions/returnPlayerInfo.js");
const {avoidRepeatString} = require("./avoidRepeat.js");

const {bridge} = require("./botBridge.js");

var config = require("./config.json");

// Options data for mcbot
options = {
    username: config.accountEmail,
    host: config.serverIP,
    version: '1.8.9',
    auth:'microsoft',
    keepAlive: true,
}
let mcbot;
reconnectTimer=10000; // Time to reconnect to minecraft server if it goes down in ms. (default 10s = 10000)

// Creates and configures minecraft bot
function createMinecraftBot(){
    mcbot = mineflayer.createBot(options);
    configureMinecraftBot(mcbot);
}

// Sets all the handlers for minecraft bot
function configureMinecraftBot(bot){
    // Regexp to match for commands/messages
    regularExpressions = {
        bwStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}[bB][wW]\\s+(?<target>[\\w]{2,17})`),
        sbStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}[sS][bB]\\s+(?<target>[\\w]{2,17})`),
        swStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}[sS][wW]\\s+(?<target>[\\w]{2,17})`),
        infoCheck: new RegExp(`^Officer > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}[iI][nN][fF][oO]\\s+(?<target>[\\w]{2,17})`),
        officerMSG: /^Officer > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: /,
        guildMSG: /^Guild > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: /,
        guildJoin: /^Guild > (?<username>[\w]{2,17}) joined\.$/,
        guildLeft: /^Guild > (?<username>[\w]{2,17}) left\.$/,
        guildMemberJoined: /^(\[.*]\s*)?(?<username>[\w]{2,17}) joined the guild!$/,
        guildMemberLeft: /^(\[.*]\s*)?([\w]{2,17}) left the guild!$/,
        guildRankChange: /^(\[.*]\s*)?([\w]{2,17}) was (promoted|demoted) from (.*) to (.*)$/,
        guildMute: /^(\[.*]\s)?([\w*]{2,17}) has muted (\[.*]\s)?([\w*]{2,17}) for (\d+[mhd])$/,
        guildUnmute: /^(\[.*]\s*)?([\w*]{2,17}) has unmuted (\[.*]\s)?([\w*]{2,17})$/,
        guildQuestCompleted: /^\s*GUILD QUEST TIER (\d) COMPLETED/,
        guildLevelUp: /^\s*The Guild has reached Level (\d*)!$/,
        guildRequestJoin: /([-]*)(\[.*]\s*)?(?<username>[\w]{2,17}) has requested to join the Guild!/
    };
    // Handlers for regexp matches
    messageHandlers = {
        guildMSG: async (user,message) => {
            try{
                regex = new RegExp(`^${config.prefix}(sw|bw|sb)\\s+(?<target>[\\w]{2,17})`); // CHECKS IF MESSAGE CONTAINS COMMAND
                
                if (!regex.test(message)){
                    //await sendMsgToDiscord(`${user+message}`,config.discordIngameTextChannel);
                    await addToMSGQueue(`${user+message}`,config.discordIngameTextChannel,false);
                }
            }
            catch (error){
                console.error("Error:",error);
            }
        },
        officerMSG: async (user,message) => {
            regex = new RegExp(`^${config.prefix}(sw|bw|sb)\\s+(?<target>[\\w]{2,17})`); // CHECKS IF MESSAGE CONTAINS COMMAND
            if (!regex.test(message)){
                //await sendMsgToDiscord(`${user+message}`,config.discordIngameOfficerTextChannel);
                await addToMSGQueue(`${user+message}`,config.discordIngameOfficerTextChannel,false);
            }
        },
        bwStatCheck: async(groups) => {
            data = await returnBWStats(groups.target);
            avoidRepeat = await avoidRepeatString();
            await mcbot.chat(`/msg ${groups.username} [${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds} ▏ ${avoidRepeat}`);
            console.log(`/msg ${groups.username} [${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds} ▏ ${avoidRepeat}`);
            //await sendLogToDiscord(`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`,config.discordBotLogsTextChannel);
            await addToMSGQueue(`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`,config.discordBotLogsTextChannel,true);
        },
        sbStatCheck: async(groups) => {
            data = await returnSBStats(groups.target);
            avoidRepeat = await avoidRepeatString();
            mcbot.chat(`/msg ${groups.username} [${data.sbLvl}] ${data.display} ▏ Networth: ${data.networth} ▏ Skill Avg.: ${data.skillAvg} ▏ ${avoidRepeat}`);
            //await sendLogToDiscord(`[${data.sbLvl}] ${data.display} ▏ Networth: ${data.networth} ▏ Skill Avg.: ${data.skillAvg}`,config.discordBotLogsTextChannel);
            await addToMSGQueue(`[${data.sbLvl}] ${data.display} ▏ Networth: ${data.networth} ▏ Skill Avg.: ${data.skillAvg}`,config.discordBotLogsTextChannel,true);
        },
        swStatCheck: async(groups) => {
            data = await returnSWStats(groups.target);
            avoidRepeat = await avoidRepeatString();
            mcbot.chat(`/msg ${groups.username} [${data.star}✮] ${data.displayName} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins} ▏ ${avoidRepeat}`);
            //await sendLogToDiscord(`[${data.star}✮] ${data.display} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins}`,config.discordBotLogsTextChannel);
            await addToMSGQueue(`[${data.star}✮] ${data.display} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins}`,config.discordBotLogsTextChannel,true);
        },
        infoCheck: async(groups) => {
            data = await returnPlayerInfo(groups.target);
            avoidRepeat = await avoidRepeatString();
            mcbot.chat(`/oc ${groups.target} ▏Network ${data.nwLevel} ▏BW ${data.bwStar} ▏SW ${data.swStar} ▏SB ${data.sbLevel} ▏${avoidRepeat}`);
            //await sendLogToDiscord(`${groups.target} ▏Network ${data.nwLevel} ▏BW ${data.bwStar} ▏SW ${data.swStar} ▏SB ${data.sbLevel}`,config.discordBotLogsTextChannel);
            await addToMSGQueue(`${groups.target} ▏Network ${data.nwLevel} ▏BW ${data.bwStar} ▏SW ${data.swStar} ▏SB ${data.sbLevel}`,config.discordBotLogsTextChannel,true);
        },
        guildJoin: async(groups)=>{
            console.log("someone joined");
        },
        guildLeft: ()=>{
            console.log("someone left");
        },
        guildRankChange: ()=>{
            console.log("rank change");
        },
        guildMute: ()=>{
            console.log("someone muted");
        },
        guildUnmute: ()=>{
            console.log("someone unmuted");
        },
        guildMemberJoined: async(groups) =>{
            message = config.welcomeMessage.replace("\\user\\",groups.username);
            await mcbot.chat(`/gc `+message);},
        guildQuestCompleted: async()=>{
            console.log("Guild Quest Tier Up");
            //await sendLogToDiscord(`Guild Quest Tier Completed!`,config.discordBotLogsTextChannel);
            await addToMSGQueue(`Guild Quest Tier Completed!`,config.discordBotLogsTextChannel,true);
        },
        guildLevelUp: async()=>{
            console.log("Guild Level Up");
            //await sendLogToDiscord('Guild Levelled up!',config.discordBotLogsTextChannel);
            await addToMSGQueue('Guild Levelled up!',config.discordBotLogsTextChannel,true);
        },
        guildRequestJoin: async(groups)=>{
            console.log("attempted to join");
            data = await returnPlayerInfo(groups.username);
            avoidRepeat = await avoidRepeatString();
            await mcbot.chat(`/oc ${groups.username} ▏Network ${data.nwLevel} ▏BW ${data.bwStar} ▏SW ${data.swStar} ▏SB ${data.sbLevel} ▏${avoidRepeat}`);
        }
    }
    // JOIN MSG
    mcbot.once('spawn', async () => {
        console.log(`Joined with ${mcbot.username}`);
        await sendLogToDiscord("MC Bot connected",config.discordBotLogsTextChannel);
    })
    // LOGIN HANDLER
    mcbot.on('login', () =>{
        mcbot.chat("/limbo");
    })
    mcbot.on('message', async (message) =>{
        try{
            console.log(message);
            if (message.extra){
                //const cleanedMsg = message.text+message.extra[0].text.replace(/§[0-9a-fA-F]/g,'')+message.extra[1].text;
                const cleanedMsg = message.text+message.extra.map((el) => el.text.replace(/§[0-9a-fA-F]/g,'')).join('');
                console.log(cleanedMsg);
                for (expression in regularExpressions){
                    const regex = regularExpressions[expression];
                    const match = cleanedMsg.match(regex);
                    if (match){
                        await sendLogToDiscord(cleanedMsg,config.discordBotLogsTextChannel);
                        if (!match.groups){
                            messageHandlers[expression](message.extra[0].text,message.extra[1].text);
                        }
                        else{
                            messageHandlers[expression](match.groups);
                        }
                        break;
                    }
                }
            }
        }
        catch(error){
            console.error("ERROR:",error);
        }
    })

    // HANDLE DISCONNECTS
    mcbot.on('end', async () => {
        console.log("MC BOT disconnected");
        await sendLogToDiscord("MC Bot disconnected",config.discordBotLogsTextChannel);
        setTimeout(reconnect,reconnectTimer);
    }
    );

    // Attempts to reconnect when the player disconnects
    function reconnect(){
        console.log("Attempting to rejoin");
        mcbot = mineflayer.createBot(options);
        configureMinecraftBot(mcbot);
    }

    // Handlers for all the discord bridge events
    bridge.on('sendMsgToMinecraft', async (message,isOfficer) => {
            msg = isOfficer? "/oc" : "/gc";
            msg+=" "+message;
            await mcbot.chat(msg);
        }
    )
    bridge.on('unmute', (playerName) => {
            mcbot.chat(`/g unmute ${playerName}`);
        }
    )
    bridge.on('mute', (playerName,duration) => {
            mcbot.chat(`/g mute ${playerName} ${duration}`);
        }
    )
    bridge.on('promote', (playerName) => {
            mcbot.chat(`/g promote ${playerName}`);
        }
    )
    bridge.on('demote', (playerName) => {
            mcbot.chat(`/g demote ${playerName}`);
        }
    )
    bridge.on('invite', (playerName) => {
            mcbot.chat(`/g invite ${playerName}`);
        }
    )
}

module.exports= {
    createMinecraftBot
}