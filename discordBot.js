require('dotenv').config();

const {Client, GatewayIntentBits} = require("discord.js");
const imageGen = require("./imageGen.js");
const {bridge} = require("./botBridge.js");

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
// FUNC TO SEND LOG TO DISC
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
            bridge.emit('sendMsgToMinecraft',`${message.member.displayName} > ${message.content}`,false);
            message.delete();
        }
        else if (message.channel.id === process.env.DISCORD_OFFICER_TEXT_CHANNEL && message.author.id!=process.env.DISCORD_USER_ID){
            bridge.emit('sendMsgToMinecraft',`${message.member.displayName} > ${message.content}`,true);
            message.delete();
        }
        else if (message.channel.id === process.env.DISCORD_BOT_LOGS_CHANNEL && message.author.id!=process.env.DISCORD_USER_ID){
            bridge.emit('sendMsgToMinecraft',message.content,false);
            message.delete();
        }
    }
})
// BOT ONLINE
dcbot.login(process.env.DISCORD_TOKEN);

dcbot.on('interactionCreate', async (interaction) =>{
    if (interaction.isCommand() && interaction.guild.id===process.env.DISCORD_GUILD){
        if (!interaction.member.roles.cache.has(process.env.OFFICER_ROLE_ID)){
            interaction.reply({content:"Insufficient role permissions", ephemeral:true})
        }
        else{
            if (interaction.commandName === "status"){
            interaction.reply({content:"Probably working :shrug:",ephemeral: true})
            }
            if (interaction.commandName === "unmute"){
                const playerName = interaction.options.getString("player-name");
                bridge.emit("unmute",playerName);
                interaction.reply({content:"Command sent",ephemeral: true})
            }
            if (interaction.commandName === "mute"){
                const playerName = interaction.options.getString("player-name");
                const duration = interaction.options.getString("duration");
                bridge.emit("mute",playerName,duration);
                interaction.reply({content:"Command sent",ephemeral: true})
            }
            if (interaction.commandName ==="promote"){
                const playerName = interaction.options.getString("player-name");
                bridge.emit("promote",playerName);
                interaction.reply({content:"Command sent",ephemeral:true});
            }
            if (interaction.commandName ==="demote"){
                const playerName = interaction.options.getString("player-name");
                bridge.emit("demote",playerName);
                interaction.reply({content:"Command sent",ephemeral:true});
            }
        }
        
    }


})

module.exports = {
    sendMsgToDiscord,
    sendLogToDiscord
}