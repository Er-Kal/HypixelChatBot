require('dotenv').config();
const readline = require("readline");
const mineflayer = require("mineflayer");
const {Client, GatewayIntentBits} = require("discord.js");

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
DISCORD_OFFICER_CHANNEL= Officers text channel for ingame bridge
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

// FETCH HYPIXEL PLAYER DATA
async function returnHypixelStats(user){
    try{
        response = await fetch(`https://api.hypixel.net/player?key=${process.env.HYPIXELKEY}&name=${user}`)
        data = await response.json();
        if (!data.success){
            if (data.cause==="You have already looked up this name recently"){
                console.log("Already Checked")
            }else{
                console.error("ERROR:",data.cause);
            }
            return data;
        }
        else{
            return data;
        }
    }
    catch (error){
        console.error("ERROR", error);
        
    }
    return "womp womp";
}
// FETCH SB PROFILE DETAILS
async function fetchSBStats(uuid){
    try{
        response = await fetch(`https://soopy.dev/api/v2/player_skyblock/${uuid}?networth=true`);
        data = await(response.json());
        if (!data.success){
            console.error("ERROR:",data.cause);
            return data;
        }
        else{
            return data;
        }
    }
    catch (error){
        console.log("ERROR:",error);
        return "";
    }
}
// RETURN SB STATS
async function returnSBStats(user){
    try{
        data = await returnHypixelStats(user);
        display = data.player.displayname;
        uuid = data.player.uuid;
        fetchedSBData = await fetchSBStats(uuid);
        currentProfileId = fetchedSBData.data.stats.currentProfileId;
        currentProfile = fetchedSBData.data.profiles[currentProfileId];
        member = currentProfile.members[uuid];
        console.log(member);
        networth = await formatNetworth(member.nwDetailed.networth);
        console.log(networth);
        skillAvg = member.skills.skillAvg.toFixed(0);
        console.log(skillAvg);
        sbLvl = member.sbLvl.toFixed(0);
        return {display: display, sbLvl: sbLvl, networth:networth,skillAvg:skillAvg};
    }
    catch (error){
        console.log(error);
        return {sbLv:0,nw:0,skillAvg:0};
    }
}
// FORMAT NETWORTH FOR OOM
async function formatNetworth(networth){
    if (networth>=1e12){ return (networth/1e12).toFixed(2)+"T" }
    if (networth>=1e9){  return (networth/1e9).toFixed(2)+"B" }
    if (networth>=1e6){  return (networth/1e6).toFixed(2)+"M" }
    if (networth>=1e3){  return (networth/1e3).toFixed(2)+"K" }
    return networth;
}
// CALC BW STATS
async function returnBWStats(user){
    try{
        
        data = await returnHypixelStats(user);
        dpName = data.player.displayname;
        bedwarStats = data.player.stats?.Bedwars;
        bedwarsStar = data.player.achievements.bedwars_level;

        totalFinalKills = (bedwarStats.eight_one_final_kills_bedwars ?? 0)+
        (bedwarStats.eight_two_final_kills_bedwars ?? 0)+
        (bedwarStats.four_four_final_kills_bedwars ?? 0)+
        (bedwarStats.four_three_final_kills_bedwars ?? 0);

        totalFinalDeaths = (bedwarStats.eight_one_final_deaths_bedwars ?? 0)+
        (bedwarStats.eight_two_final_deaths_bedwars ?? 0)+
        (bedwarStats.four_four_final_deaths_bedwars ?? 0)+
        (bedwarStats.four_three_final_deaths_bedwars ?? 0);
        
        totalBedsBroken = (bedwarStats.eight_one_beds_broken_bedwars ?? 0)+
        (bedwarStats.eight_two_beds_broken_bedwars ?? 0)+
        (bedwarStats.four_four_beds_broken_bedwars ?? 0)+
        (bedwarStats.four_three_beds_broken_bedwars ?? 0);

        totalBedsLost = (bedwarStats.eight_one_beds_lost_bedwars ?? 0)+
        (bedwarStats.eight_two_beds_lost_bedwars ?? 0)+
        (bedwarStats.four_four_beds_lost_bedwars ?? 0)+
        (bedwarStats.four_three_beds_lost_bedwars ?? 0);

        bedwarsWins = bedwarStats.wins_bedwars || 0;
        bedwarsLosses = bedwarStats.losses_bedwars || 1;

        fkdr = ((totalFinalKills || 1)/(totalFinalDeaths || 1)).toFixed(2);
        bblr = ((totalBedsBroken || 1)/(totalBedsLost || 1)).toFixed(2);
        winLoss = (bedwarsWins/bedwarsLosses).toFixed(2);
        return {display: dpName, finals: fkdr, beds: bblr, star: bedwarsStar,wlr : winLoss};
    }
    catch(error){
        console.error("ERROR:",error)
    }
    return {finals: 0, beds : 0, star: 0};
}
// INIT MC BOT
const mcbot = mineflayer.createBot(options);
minecraftBot(mcbot);
function minecraftBot(mcbot){
    // JOIN MSG
    mcbot.once('spawn', () => {
        console.log(`Joined with ${mcbot.username}`);
        
        mcbot.addChatPattern("bwStatCheck",new RegExp(`^(?:Guild|Officer) > (\\[.*]\\s*)?([\\w]{2,17}).*?(\\[.{1}])?: ${process.env.PREFIX}bw ([\\w]{2,17})$`),{parse:true, repeat: true});
        mcbot.addChatPattern("sbStatCheck",new RegExp(`^(?:Guild|Officer) > (\\[.*]\\s*)?([\\w]{2,17}).*?(\\[.{1}])?: ${process.env.PREFIX}sb ([\\w]{2,17})$`),{parse:true, repeat: true});
        mcbot.addChatPattern("guildMSG", new RegExp(`^Guild > (\\[.*]\\s*)?([\\w]{2,17}).*?(\\[.{1,15}])?: (?!${process.env.PREFIX}bw|${process.env.PREFIX}sb)(.*)$`),{parse:true, repeat: true});
        mcbot.addChatPattern("officerMSG", new RegExp(`^Officer > (\\[.*]\\s*)?([\\w]{2,17}).*?(\\[.{1,15}])?: (?!${process.env.PREFIX}bw|${process.env.PREFIX}sb)(.*)$`),{parse:true, repeat: true});
        mcbot.addChatPattern("guildJoin", new RegExp(`^Guild > ([\\w]{2,17}) joined\.$`),{parse:true, repeat: true});
        mcbot.addChatPattern("guildLeft", new RegExp(`^Guild > ([\\w]{2,17}) left\.$`),{parse:true, repeat: true});
    })
    // LOGIN HANDLER
    mcbot.on('login', () =>{
        mcbot.chat("/limbo");
    })
    // BW STAT CHECK HANDLER
    mcbot.on('chat:bwStatCheck', async (args)=>{
        args = args.flat();
        data = await returnBWStats(args[3]);
        mcbot.chat(`/msg ${args[1]} [${data.star}✫] ${data.display} | FKDR: ${data.finals} | WLR: ${data.wlr} | BBLR: ${data.beds}`);
    })
    // SB STAT CHECK HANDLER
    mcbot.on('chat:sbStatCheck', async (args)=>{
        try{
            args = args.flat();
            data = await returnSBStats(args[3]);
            mcbot.chat(`/msg ${args[1]} [${data.sbLvl}] ${data.display} | Networth: ${data.networth} | Skill Avg.: ${data.skillAvg}`);
        }
        catch (error){
            console.error("Truncation error:",error);
        }
    })
    // GUILD MSG HANDLER
    mcbot.on('chat:guildMSG', async (args) =>{
        args = args.flat();
        console.log(args);
        await sendMsgToDiscord(`${args[0] ?? ""}${args[1]} ${args[2]}: ${args[3]}`,process.env.DISCORD_TEXT_CHANNEL);
    })
    // OFFICER MSG HANDLER
    mcbot.on('chat:officerMSG', async (args) =>{
        args = args.flat();
        console.log(args);
        await sendMsgToDiscord(`${args[0] ?? ""}${args[1]} ${args[2]}: ${args[3]}`,process.env.DISCORD_OFFICER_TEXT_CHANNEL);
    })
    // GUILD JOIN HANDLER
    mcbot.on('chat:guildJoin', async (username) =>{
        username = username.flat();
            await sendMsgToDiscord(`Guild > ${username} joined.`,process.env.DISCORD_BOT_LOGS_CHANNEL);
    })
    // GUILD LEFT HANDLER
    mcbot.on('chat:guildLeft', async (username) =>{
        username = username.flat();
        await sendMsgToDiscord(`Guild > ${username} left.`,process.env.DISCORD_BOT_LOGS_CHANNEL);
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
        
        //console.log("Bot's channels:", dcbot.channels.cache.map(c => `${c.name} (${c.id})`));
        console.log("Bot is online!")
        //sendMsgToDiscord("Bot is online").catch(console.error);
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

            await channel.send(message);
        }
        catch (error){
            console.error("ERROR:",error);
        }
    }
    // MESSAGE HANDLER DISCORD
    dcbot.on('messageCreate', async (message) => {
        if (message.channel.id === process.env.DISCORD_TEXT_CHANNEL && message.author.id!=process.env.DISCORD_USER_ID){
            const bannedInputs = ["http:","https:"];
            if (!bannedInputs.some(ban=>message.content.includes(ban))){
                await mcbot.chat(`/gc ${message.author.tag} > ${message.content}`);
                message.delete();
            }
        }
    })
    // BOT ONLINE
    dcbot.login(process.env.DISCORD_TOKEN);
}




