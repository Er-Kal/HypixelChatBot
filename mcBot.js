require('dotenv').config();
const { sendLogToDiscord, sendMsgToDiscord} = require("./discordBot");
const mineflayer = require("mineflayer");
const {returnSBStats} = require("./statFunctions/returnSBStats.js");
const {returnBWStats} = require("./statFunctions/returnBWStats.js");
const {returnSWStats} = require("./statFunctions/returnSWStats.js");

const {bridge} = require("./botBridge.js");

options = {
    username: process.env.MC_USERNAME,
    host: process.env.SERVER_IP,
    version: '1.8.9',
    auth:'microsoft',
    keepAlive: true,
}
let mcbot;
reconnectTimer=10000; // Time to reconnect to minecraft server if it goes down in ms. (default 30s = 10000)

function createMinecraftBot(){
    mcbot = mineflayer.createBot(options);
    configureMinecraftBot(mcbot);
}

function configureMinecraftBot(bot){
    regularExpressions = {
        bwStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${process.env.PREFIX}bw\\s+(?<target>[\\w]{2,17})`),
        sbStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${process.env.PREFIX}sb\\s+(?<target>[\\w]{2,17})`),
        swStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${process.env.PREFIX}sw\\s+(?<target>[\\w]{2,17})`),
        officerMSG: /^Officer > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: /,
        guildMSG: /^Guild > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: /,
        guildJoin: /^Guild > (?<username>[\w]{2,17}) joined\.$/,
        guildLeft: /^Guild > (?<username>[\w]{2,17}) left\.$/,
        guildMemberJoined: /^(\[.*]\s*)?(?<username>[\w]{2,17}) joined the guild!$/,
        guildMemberLeft: /^(\[.*]\s*)?([\w]{2,17}) left the guild!$/,
        guildRankChange: /^(\[.*]\s*)?([\w]{2,17}) was (promoted|demoted) from (.*) to (.*)$/,
        guildMute: /^(\[.*]\s)?([\w*]{2,17}) has muted (\[.*]\s)?([\w*]{2,17}) for (\d+[mhd])$/,
        guildUnmute: /^(\[.*]\s)?([\w*]{2,17}) has unmuted (\[.*]\s)?([\w*]{2,17})$/
    };
    messageHandlers = {
        guildMSG: async (user,message) => {
            try{
                regex = new RegExp(`^${process.env.PREFIX}(sw|bw|sb)\\s+(?<target>[\\w]{2,17})`); // CHECKS IF MESSAGE CONTAINS COMMAND
                
                if (!regex.test(message)){
                    await sendMsgToDiscord(`${user+message}`,process.env.DISCORD_TEXT_CHANNEL);
                }
            }
            catch (error){
                console.error("Error:",error);
            }
        },
        officerMSG: async (user,message) => {
            regex = new RegExp(`^${process.env.PREFIX}(sw|bw|sb)\\s+(?<target>[\\w]{2,17})`); // CHECKS IF MESSAGE CONTAINS COMMAND
            if (!regex.test(message)){
                await sendMsgToDiscord(`${user+message}`,process.env.DISCORD_OFFICER_TEXT_CHANNEL);
            }
        },
        bwStatCheck: async(groups) => {
            data = await returnBWStats(groups.target);
            await mcbot.chat(`/msg ${groups.username} [${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`);
            await sendLogToDiscord(`[${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`,process.env.DISCORD_BOT_LOGS_CHANNEL);
        },
        sbStatCheck: async(groups) => {
            data = await returnSBStats(groups.target);
            mcbot.chat(`/msg ${groups.username} [${data.sbLvl}] ${data.display} ▏ Networth: ${data.networth} ▏ Skill Avg.: ${data.skillAvg}`);
            await sendLogToDiscord(`[${data.sbLvl}] ${data.display} ▏ Networth: ${data.networth} ▏ Skill Avg.: ${data.skillAvg}`,process.env.DISCORD_BOT_LOGS_CHANNEL);
        },
        swStatCheck: async(groups) => {
            data = await returnSWStats(groups.target);
            mcbot.chat(`/msg ${groups.username} [${data.star}✮] ${data.display} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins}`);
            await sendLogToDiscord(`[${data.star}✮] ${data.display} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins}`,process.env.DISCORD_BOT_LOGS_CHANNEL);
        },
        guildJoin: ()=>{
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
            await mcbot.chat(`/gc Welcome ${groups.username}!`);
        }
    }
    // JOIN MSG
    mcbot.once('spawn', () => {
        console.log(`Joined with ${mcbot.username}`);
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
                        await sendLogToDiscord(cleanedMsg,process.env.DISCORD_BOT_LOGS_CHANNEL);
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
    mcbot.on('end', () => {
        console.log("MC BOT disconnected");
        setTimeout(reconnect,reconnectTimer);
        dcbot.destroy();
    }
    );
    function reconnect(){
        console.log("Attempting to rejoin");
        mcbot = mineflayer.createBot(options);
        minecraftBot(mcbot);
    }
    bridge.on('sendMsgToMinecraft', (message,isOfficer) => {
            msg = isOfficer? "/oc" : "/gc";
            msg+=" "+message;
            mcbot.chat(msg);
        }
    )
    bridge.on('unmute', (playerName) => {
        console.log("WAIT FIX");
            //mcbot.chat(`/g unmute ${playerName}`);
        }
    )
    bridge.on('mute', (playerName,duration) => {
        console.log("WAIT FIX");
            //mcbot.chat(`/g mute ${playerName} ${duration}`);
        }
    )/
}

module.exports= {
    createMinecraftBot
}