const {sendLogToDiscord} = require("./discordBot");
const mineflayer = require("mineflayer");
const {regularExpressions, messageHandlers} = require("./statFunctions/regexp.js");
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
            const {text, extra} = message;
            if (!extra){
                return;
            }
            const cleanedMsg = text+extra.map((el) => el.text.replace(/§[0-9a-fA-F]/g,'')).join('');
            console.log("Cleaned Message:",cleanedMsg);
            
            for (expression in regularExpressions){
                const regex = regularExpressions[expression];
                const match = cleanedMsg.match(regex);
                
                if (match){
                    if (expression!="guildRequestJoin"){
                        await sendLogToDiscord(cleanedMsg,config.discordBotLogsTextChannel);
                    }
                    if (!match.groups){
                        await messageHandlers[expression](extra[0].text,extra[1].text);
                    }
                    else{
                        await messageHandlers[expression](match.groups);
                    }
                    break;
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
    bridge.on('unmute', async (playerName) => {
            await mcbot.chat(`/g unmute ${playerName}`);
        }
    )
    bridge.on('mute', async (playerName,duration) => {
            await mcbot.chat(`/g mute ${playerName} ${duration}`);
        }
    )
    bridge.on('promote', async (playerName) => {
            await mcbot.chat(`/g promote ${playerName}`);
        }
    )
    bridge.on('demote', async (playerName) => {
            await mcbot.chat(`/g demote ${playerName}`);
        }
    )
    bridge.on('invite', async (playerName) => {
            await mcbot.chat(`/g invite ${playerName}`);
        }
    )
    bridge.on('sendMinecraftDM', async (username,message) => {
            await mcbot.chat(`/msg ${username} ${message}`);
            console.log(`Sent DM to ${username}: ${message}`);
        }
    )
}

module.exports= {
    createMinecraftBot
}