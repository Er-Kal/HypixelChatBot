const {Client, GatewayIntentBits} = require("discord.js");
const imageGen = require("./imageGen.js");
const {bridge} = require("./botBridge.js");



// Message queue for discord messages
queue = [];
queueEmpty = true;

async function addToMSGQueue(message,channelID,log){
    // Adds a message to the queue
    queue.push({message,channelID,log});
    if (queueEmpty){
        processQueue();
    }
}

async function processQueue(){
    while (queue.length > 0){
        queueEmpty = false;
        const queueTask = queue.shift();
        if (queueTask.log){
            await sendLogToDiscord(queueTask.message,queueTask.channelID);
        }
        else{
            await sendMsgToDiscord(queueTask.message,queueTask.channelID);
        }
    }
    queueEmpty = true;
}


var config = require("./config.json");
// Initialises discord bot
const dcbot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});
// Event handler for when discord bot is online, sends simple message
dcbot.on('ready', async () => {
    console.log("Bot is online!")
});
// Function that sends a message to discord. Uses image gen.
// Used for sending minecraft messages with color formatting.
async function sendMsgToDiscord(message,channelID){
    try{
        const guild = dcbot.guilds.cache.get(config.discordServerID);
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
// Function to send log messages to discord
// Used for simple text such as join messages, etc.
async function sendLogToDiscord(message,channelID){
    try{
        const guild = dcbot.guilds.cache.get(config.discordServerID);
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

// Handles when messages are sent in the specific channels. 
dcbot.on('messageCreate', async (message) => {
    const bannedInputs = ["http:","https:","doxx","doxxed","doxxer","doxxing","doxing","doxes","doxxes","cunt","dox"];
    // Simple check to see if message includes links lwk unnecessary since hypixel stops these anyway
    const containsIP = message.content.match(/(?:[\d]{1,4}\s){2,3}(?:[\d]{1,4})/)
    if (message.author.id === dcbot.user.id){
        return;
    }
    if (bannedInputs.some(ban=>message.content.includes(ban)) || containsIP){
        setTimeout(() => message.delete(),500);
        return;
    }
    if (message.channel.id === config.discordIngameTextChannel && message.author.id!=config.discordUserID){
        bridge.emit('sendMsgToMinecraft',`${message.member.displayName} > ${message.content}`,false);
        setTimeout(() => message.delete(),200);
        return;
    }
    // Officer channel messages
    if (message.channel.id === config.discordIngameOfficerTextChannel && message.author.id!=config.discordUserID){
        bridge.emit('sendMsgToMinecraft',`${message.member.displayName} > ${message.content}`,true);
        setTimeout(() => message.delete(),200);
        return;
    }
    // Bot channel messages, sends a message without username
    if (message.channel.id === config.discordBotLogsTextChannel && message.author.id!=config.discordUserID){
        bridge.emit('sendMsgToMinecraft',message.content,false);
        setTimeout(() => message.delete(),200);
        return;
    }
})
// Makes the bot login/go online
dcbot.login(config.discordBotToken);

// Command handler
// Most commands sent through the minecraft bot: (un)mute, pro/demote
dcbot.on('interactionCreate', async (interaction) =>{
    // Check to see if message is a command and for the guild. 
    if (interaction.isCommand() && interaction.guild.id===config.discordServerID){
        // Check if the command user has officer role
        if (!interaction.member.roles.cache.has(config.discordOfficerRoleID)){
            interaction.reply({content:"Insufficient role permissions", ephemeral:true})
        }
        else{
            // Status command, does nada
            if (interaction.commandName === "status"){
            interaction.reply({content:"Probably working :shrug:",ephemeral: true})
            }
            // Unmute command
            if (interaction.commandName === "unmute"){
                const playerName = interaction.options.getString("player-name");
                bridge.emit("unmute",playerName);
                interaction.reply({content:"Command sent",ephemeral: true})
            }
            // Mute Command
            if (interaction.commandName === "mute"){
                const playerName = interaction.options.getString("player-name");
                const duration = interaction.options.getString("duration");
                bridge.emit("mute",playerName,duration);
                interaction.reply({content:"Command sent",ephemeral: true})
            }
            // Promote command
            if (interaction.commandName ==="promote"){
                const playerName = interaction.options.getString("player-name");
                bridge.emit("promote",playerName);
                interaction.reply({content:"Command sent",ephemeral:true});
            }
            // Demote command
            if (interaction.commandName ==="demote"){
                const playerName = interaction.options.getString("player-name");
                bridge.emit("demote",playerName);
                interaction.reply({content:"Command sent",ephemeral:true});
            }
            // Demote command
            if (interaction.commandName ==="invite"){
                const playerName = interaction.options.getString("player-name");
                bridge.emit("invite",playerName);
                interaction.reply({content:"Command sent",ephemeral:true});
            }
        }
        
    }

})

module.exports = {
    sendMsgToDiscord,
    sendLogToDiscord,
    addToMSGQueue
}