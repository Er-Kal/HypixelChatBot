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
DISCORD_TEXT_CHANNEL= Discord text channel ID
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
        
        mcbot.addChatPattern("bwStatCheck",new RegExp(`^Guild > (\\[.*]\\s*)?([\\w]{2,17}).*?(\\[.{1}])?: ${process.env.PREFIX}bw ([\\w]{2,17})$`),{parse:true, repeat: true});
        mcbot.addChatPattern("guildMSG", new RegExp(`^Guild > (\\[.*]\\s*)?([\\w]{2,17}).*?(\\[.{1,15}])?: (?!${process.env.PREFIX}bw)(.*)$`),{parse:true, repeat: true});
    })
    // LOGIN HANDLER
    mcbot.on('login', () =>{
        mcbot.chat("/limbo");
    })
    // STAT CHECK HANDLER
    mcbot.on('chat:bwStatCheck', async (args)=>{
        args = args.flat();
        data = await returnBWStats(args[3]);
        mcbot.chat(`/msg ${args[1]} [${data.star}] ${data.display} FKDR: ${data.finals} BBLR: ${data.beds} WLR ${data.wlr}`);
    })
    // GUILD MSG HANDLER
    mcbot.on('chat:guildMSG', async (args) =>{
        args = args.flat();
        console.log(args);
        if (args[1]!=mcbot.username){
            console.log("chat event");
            await sendMsgToDiscord(`${args[0]}${args[1]} ${args[2]}: ${args[3]}`);
        };
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
    async function sendMsgToDiscord(message){
        console.log("....");
        try{
            const guild = dcbot.guilds.cache.get(process.env.DISCORD_GUILD);
            if (!guild){
                console.error("Bot not in discord guild");
            }

            const channel = await guild.channels.fetch(process.env.DISCORD_TEXT_CHANNEL, { force: true });
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
    dcbot.on('messageCreate', (message) => {
        if (message.channel.id === process.env.DISCORD_TEXT_CHANNEL && message.author.id!=process.env.DISCORD_USER_ID){
            const bannedInputs = ["http:","https:"];
            if (!bannedInputs.some(ban=>message.content.includes(ban))){
                mcbot.chat(`/gc ${message.author.tag} > ${message.content}`);
            }
        }
    })
    // BOT ONLINE
    dcbot.login(process.env.DISCORD_TOKEN);
}




