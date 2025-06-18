var config = require("../config.json");

const {addToMSGQueue} = require("../discordBot.js");

const {returnSBStats} = require("./return-sb-stats.js");
const {returnBWStats} = require("./return-bw-stats.js");
const {returnBWOStats} = require("./return-bwo-stats.js");
const {returnSWStats} = require("./return-sw-stats.js");
const {returnPlayerInfo} = require("./return-player-info.js");
const {avoidRepeatString} = require("./avoidRepeat.js");
const {bridge} = require("../botBridge.js");

regularExpressions = {
    bedwarsStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}bw\\s+((?<mode>core|solo|duo|three|four|overall|fvf)\\s)?(?<target>[\\w]{2,17})`,'i'),
    //bwStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}bw\\s+(?<target>[\\w]{2,17})`,'i'),
    sbStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}sb\\s+(?<target>[\\w]{2,17})`,'i'),
    swStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}sw\\s+(?<target>[\\w]{2,17})`,'i'),
    bwoStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${config.prefix}bwo\\s+(?<target>[\\w]{2,17})`,'i'),
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
    guildRequestJoin: /^[-]*[\n\r](\[.*]\s*)?(?<username>[\w]{2,17}) has requested to join the Guild![\n\r]Click here to accept or type \/guild accept [\w]{2,17}![\n\r][-]*[\n\r]$/    
};

messageHandlers = {
    bedwarsStatCheck: async(groups) => {
        const {username, target, mode} = groups;
        console.log("BW Stat Check:", username, target, mode);
        avoidRepeat = await avoidRepeatString();
        
        if (mode === undefined){
            data = await returnBWStats(groups.target,"core");
        }
        else{
            data = await returnBWStats(groups.target,mode.toLowerCase());
        }

        bridge.emit('sendMinecraftDM',groups.username,`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds} ▏ ${avoidRepeat}`);
            await addToMSGQueue(`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`,config.discordBotLogsTextChannel,true);
    },

    guildMSG: async (user,message) => {
        try{
            regex = new RegExp(`^${config.prefix}(sw|bw|sb)\\s+(?<target>[\\w]{2,17})`); // CHECKS IF MESSAGE CONTAINS COMMAND
            
            if (!regex.test(message)){
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
            await addToMSGQueue(`${user+message}`,config.discordIngameOfficerTextChannel,false);
        }
    },

    bwStatCheck: async(groups) => {
        data = await returnBWStats(groups.target);
        avoidRepeat = await avoidRepeatString();
        bridge.emit('sendMinecraftDM',groups.username,`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds} ▏ ${avoidRepeat}`);
        await addToMSGQueue(`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`,config.discordBotLogsTextChannel,true);
    },

    sbStatCheck: async(groups) => {
        data = await returnSBStats(groups.target);
        avoidRepeat = await avoidRepeatString();
        bridge.emit('sendMinecraftDM',groups.username,`[${data.sbLvl}] ${data.display} ▏ Networth: ${data.networth} ▏ Skill Avg.: ${data.skillAvg} ▏ ${avoidRepeat}`)
        await addToMSGQueue(`[${data.sbLvl}] ${data.display} ▏ Networth: ${data.networth} ▏ Skill Avg.: ${data.skillAvg}`,config.discordBotLogsTextChannel,true);
    },

    swStatCheck: async(groups) => {
        data = await returnSWStats(groups.target);
        avoidRepeat = await avoidRepeatString();
        console.log()
        bridge.emit('sendMinecraftDM',groups.username,`[${data.star}✮] ${data.displayName} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins} ▏ ${avoidRepeat}`)
        await addToMSGQueue(`[${data.star}✮] ${data.display} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins}`,config.discordBotLogsTextChannel,true);
    },

    infoCheck: async(groups) => {
        data = await returnPlayerInfo(groups.target);
        avoidRepeat = await avoidRepeatString();
        bridge.emit('sendMsgToMinecraft',`${groups.target} ▏Network ${data.nwLevel} ▏BW ${data.bwStar} ▏SW ${data.swStar} ▏SB ${data.sbLevel} ▏${avoidRepeat}`,true);
        await addToMSGQueue(`${groups.target} ▏Network ${data.nwLevel} ▏BW ${data.bwStar} ▏SW ${data.swStar} ▏SB ${data.sbLevel}`,config.discordBotLogsTextChannel,true);
    },

    guildJoin: async(groups)=>{
        console.log("someone joined");
    },

    guildLeft: async ()=>{
        console.log("someone left");
    },

    guildRankChange: async ()=>{
        console.log("rank change");
    },

    guildMute: async ()=>{
        console.log("someone muted");
    },

    guildUnmute: async ()=>{
        console.log("someone unmuted");
    },

    guildMemberJoined: async (groups) =>{
        message = config.welcomeMessage.replace("\\user\\",groups.username);
        bridge.emit('sendMsgToMinecraft',message,false);
    },

    guildMemberLeft: async (groups) =>{
        console.log("Someone left the guild lol");
    },

    guildQuestCompleted: async ()=>{
        console.log("Guild Quest Tier Up");
        await addToMSGQueue(`Guild Quest Tier Completed!`,config.discordBotLogsTextChannel,true);
    },

    guildLevelUp: async ()=>{
        console.log("Guild Level Up");
        await addToMSGQueue('Guild Levelled up!',config.discordBotLogsTextChannel,true);
    },

    guildRequestJoin: async (groups)=>{
        console.log("attempted to join");
        data = await returnPlayerInfo(groups.username);
        avoidRepeat = await avoidRepeatString();
        bridge.emit('sendMsgToMinecraft',`${groups.username} ▏Network ${data.nwLevel} ▏BW ${data.bwStar} ▏SW ${data.swStar} ▏SB ${data.sbLevel} ▏${avoidRepeat}`,true)
    },

    bwoStatCheck: async(groups) => {
        data = await returnBWOStats(groups.target);
        avoidRepeat = await avoidRepeatString();
        bridge.emit('sendMinecraftDM',groups.username,`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds} ▏ ${avoidRepeat}`);;
        await addToMSGQueue(`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`,config.discordBotLogsTextChannel,true);
    }
}
module.exports = {regularExpressions, messageHandlers};