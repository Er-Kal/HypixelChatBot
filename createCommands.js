require("dotenv").config();

const {REST, Routes, SlashCommandBuilder,PermissionFlagsBits} = require("discord.js")


const botID = process.env.DISCORD_USER_ID;
const serverID = process.env.DISCORD_GUILD;
const botToken = process.env.DISCORD_TOKEN;

const rest = new REST().setToken(botToken);

commands = [
    new SlashCommandBuilder().setName("status").setDescription("Status of the bots")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder().setName("unmute").setDescription("Unmute a player")
    .addStringOption(option => {
        return option.setName("player-name").setDescription("The name of the player you want to unmute").setRequired(true);
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder().setName("mute").setDescription("Mute a player")
    .addStringOption(option => {
        return option.setName("player-name").setDescription("The name of the player you want to mute").setRequired(true);
    })
    .addStringOption(option => {
        return option.setName("duration").setDescription("The length of time you want to mute them for eg. 5m (m-minutes, h-hours, d-days.)").setRequired(true);
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
]

const registerSlash = async () =>{
    try{
        await rest.put(Routes.applicationGuildCommands(botID,serverID),{
            body: commands
        })
    }
    catch(error){
        console.error(error);
    }

}
registerSlash();