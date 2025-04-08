require('dotenv').config();
const readline = require("readline");
const mineflayer = require("mineflayer");
const {Client, GatewayIntentBits} = require("discord.js");

// FETCH HYPIXEL PLAYER DATA
async function returnHypixelStats(user){
    try{
        response = await fetch(`https://api.hypixel.net/player?key=${process.env.HYPIXELKEY}&name=${user}`)
        data = await response.json();
        if (!data.success){
            console.error("ERROR:",data.cause);
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
    bedwarStats = data.player.stats?.Bedwars;
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

    fkdr = ((totalFinalKills || 1)/(totalFinalDeaths || 1)).toFixed(2);
    bblr = ((totalBedsBroken || 1)/(totalBedsLost || 1)).toFixed(2);
    return {finals: fkdr, beds: bblr};
    }
    catch(error){
        console.error("ERROR:",error)
    }
    return {finals: 0, beds : 0}
}

// INIT MC BOT
const mcbot = mineflayer.createBot({
    username: process.env.MC_USERNAME,
    password: process.env.MC_PASSWORD,
    host: process.env.SERVER_IP,
    version: '1.8.9',
    auth:'microsoft',
    keepAlive: true,
})
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
    mcbot.chat(`msg ${args[0]} ${args[3]} FKDR: ${data.finals} BBLR: ${data.beds}`);
})
// GUILD MSG HANDLER
mcbot.on('chat:guildMSG', async (args) =>{
    args = args.flat();
    console.log(args);
    sendMsgToDiscord(`${args[0]}${args[1]} ${args[2]}: ${args[3]}`);
})
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
    sendMsgToDiscord("online").catch(console.error);
});
// FUNC TO SEND MSG TO DISC
async function sendMsgToDiscord(message){
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
// BOT ONLINE
dcbot.login(process.env.DISCORD_TOKEN);
