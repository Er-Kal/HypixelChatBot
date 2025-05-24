const {returnHypixelStats} = require("./returnHypixelStats.js");

async function returnPlayerInfo(user){
    try{
        data = await returnHypixelStats(user);
        hypixelNetworkLevel = ((sqrt((2 * data.player.networkExp) + 30625) / 50) - 2.5).toFixed(0) ?? 0;
        hypixelBedwarsStar = data.player.achievements.bedwars_level ?? 0;
        hypixelSkywarsStar = data.player.achievements.skywars_you_re_a_star ?? 0;
        hypixelSkywarsStar = data.player.achievements.skyblock_sb_level ?? 0;
    }
    catch (error){
        console.log("Error:", error);
    }
}

module.exports = {
    returnPlayerInfo
}