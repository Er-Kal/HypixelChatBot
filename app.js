require('dotenv').config();
const readline = require("readline");
const mineflayer = require("mineflayer");
const {Client, GatewayIntentBits} = require("discord.js");
const imageGen = require("./imageGen.js");
const {returnSBStats} = require("./statFunctions/returnSBStats.js");
const {returnBWStats} = require("./statFunctions/returnBWStats.js");
const {returnSWStats} = require("./statFunctions/returnSWStats.js");
/*
.env variables
MC_USERNAME= Minecraft account email
SERVER_IP= Minecraft server ip, idk most 100% will be hypixel.net
PREFIX= A prefix used for the commands (eg, ! ? /)
HYPIXELKEY= Hypixel dev api key
DISCORD_TOKEN= Discord bot token
DISCORD_USER_ID= Discord bot user ID
DISCORD_TEXT_CHANNEL= Regular members text channel for ingame bridge
DISCORD_BOT_LOGS_CHANNEL= Discord bot/logs or officer channel. Provides more details like join/leaves.
DISCORD_OFFICER_TEXT_CHANNEL= Officers text channel for ingame bridge
DISCORD_GUILD= Discord server ID
*/

options = {
    username: process.env.MC_USERNAME,
    host: process.env.SERVER_IP,
    version: '1.8.9',
    auth:'microsoft',
    keepAlive: true,
}
reconnectTimer=10000; // Time to reconnect to minecraft server if it goes down in ms. (default 30s = 10000)

// INIT MC BOT
const mcbot = mineflayer.createBot(options);
minecraftBot(mcbot);
function minecraftBot(mcbot){
    regularExpressions = {
        bwStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${process.env.PREFIX}bw\\s+(?<target>[\\w]{2,17})`),
        sbStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${process.env.PREFIX}sb\\s+(?<target>[\\w]{2,17})`),
        swStatCheck: new RegExp(`^(?:Guild|Officer) > (?:\\[.*]\\s*)?(?<username>[\\w]{2,17})(?:.*?\\[.{1,2}])?:\\s*${process.env.PREFIX}sw\\s+(?<target>[\\w]{2,17})`),
        officerMSG: /^Officer > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: /,
        guildMSG: /^Guild > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: /,
        guildJoin: new RegExp(`^Guild > (?<username>[\\w]{2,17}) joined\.$`),
        guildLeft: new RegExp(`^Guild > (?<username>[\\w]{2,17}) left\.$`),
    };
    messageHandlers = {
        guildMSG: async (user,message) => {
            regex = new RegExp(`^${process.env.PREFIX}(sw|bw|sb)\\s+(?<target>[\\w]{2,17})`); // CHECKS IF MESSAGE CONTAINS COMMAND
            
            if (!regex.test(message)){
                await sendMsgToDiscord(`${user+message}`,process.env.DISCORD_TEXT_CHANNEL);
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
            mcbot.chat(`/msg ${groups.username} [${data.star}✫] ${data.display} ▏ FKDR: ${data.finals} ▏ WLR: ${data.wlr} ▏ BBLR: ${data.beds}`);
        },
        sbStatCheck: async(groups) => {
            data = await returnSBStats(groups.target);
            mcbot.chat(`/msg ${groups.username} [${data.sbLvl}] ${data.display} ▏Networth: ${data.networth} ▏Skill Avg.: ${data.skillAvg}`);
        },
        swStatCheck: async(groups) => {
            data = await returnSWStats(groups.target);
            mcbot.chat(`/msg ${groups.username} [${data.star}✮] ${data.display} ▏ KDR: ${data.kdr} ▏ WLR: ${data.wlr} ▏ Kills: ${data.kills} ▏ Wins: ${data.wins}`);
        },
        guildJoin: async(user) =>{
            const {username} = user;
            await sendLogToDiscord(`Guild > ${username} joined.`,process.env.DISCORD_BOT_LOGS_CHANNEL);
        },
        guildLeft: async(user) =>{
            const {username} = user;
            await sendLogToDiscord(`Guild > ${username} left.`,process.env.DISCORD_BOT_LOGS_CHANNEL);
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

    mcbot.on('message', (message) =>{
        try{
            if (message.extra){
                const cleanedMsg = message.text+message.extra[0].text.replace(/§[0-9a-fA-F]/g,'')+message.extra[1].text;
                for (expression in regularExpressions){
                    const regex = regularExpressions[expression];
                    const match = cleanedMsg.match(regex);
                    if (match){
                        if (!match.groups){
                            messageHandlers[expression](message.extra[0].text,message.extra[1].text);
                        }
                        else{
                            messageHandlers[expression](match.groups);
                        }
                    }
                }
            }
        }
        catch(error){
            console.error("ERROR: womp womp");
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
    // DISC BOT INIT
    const dcbot = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    });
    // DISC BOT INIT HANDLER
    dcbot.on('ready', async () => {
        console.log("Bot is online!")
    });
    // FUNC TO SEND MSG TO DISC
    async function sendMsgToDiscord(message,channelID){
        try{
            const guild = dcbot.guilds.cache.get(process.env.DISCORD_GUILD);
            if (!guild){
                console.error("Bot not in discord guild");
            }

            const channel = await guild.channels.fetch(channelID, { force: true });
            if (!channel){
                console.error("Channel not found");
            }
            
            if (channel.isThread?.()) {
                await channel.join();
            }
            console.log("Generating img");
            image = await imageGen.drawMinecraftText(message);
            console.log("Img generated");
            await channel.send({
                files: [{
                    attachment:image,
                    name:'image.png',
                }]
            });
        }
        catch (error){
            console.error("ERROR:",error);
        }
    }
    async function sendLogToDiscord(message,channelID){
        try{
            const guild = dcbot.guilds.cache.get(process.env.DISCORD_GUILD);
            if (!guild){
                console.error("Bot not in discord guild");
            }

            const channel = await guild.channels.fetch(channelID, { force: true });
            if (!channel){
                console.error("Channel not found");
            }
            
            if (channel.isThread?.()) {
                await channel.join();
            }
            await channel.send(message);
        }
        catch (error){
            console.error("ERROR:",error);
        }
    }
    // MESSAGE HANDLER DISCORD
    dcbot.on('messageCreate', async (message) => {
        const bannedInputs = ["http:","https:"];
        if (!bannedInputs.some(ban=>message.content.includes(ban))){
            if (message.channel.id === process.env.DISCORD_TEXT_CHANNEL && message.author.id!=process.env.DISCORD_USER_ID){
                await mcbot.chat(`/gc ${message.member.displayName} > ${message.content}`);
                message.delete();
            }
            else if (message.channel.id === process.env.DISCORD_OFFICER_TEXT_CHANNEL && message.author.id!=process.env.DISCORD_USER_ID){
                await mcbot.chat(`/oc ${message.member.displayName} > ${message.content}`);
                message.delete();
            }
            else if (message.channel.id === process.env.DISCORD_BOT_LOGS_CHANNEL && message.author.id!=process.env.DISCORD_USER_ID){
                await mcbot.chat(`/gc ${message.content}`);
                message.delete();
            }
        }
    })
    // BOT ONLINE
    dcbot.login(process.env.DISCORD_TOKEN);
}




