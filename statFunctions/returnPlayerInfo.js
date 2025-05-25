const {returnHypixelStats} = require("./returnHypixelStats.js");

async function returnPlayerInfo(user){
    try{
        data = await returnHypixelStats(user);
        hypixelNetworkLevel = ((Math.sqrt((2 * data.player.networkExp) + 30625) / 50) - 2.5).toFixed(0) ?? 0;
        console.log(data.player.achievements);
        hypixelBedwarsStar = data.player.achievements.bedwars_level ?? 0;
        hypixelSkywarsStar = data.player.achievements.skywars_you_re_a_star ?? 0;
        hypixelSkyblockLevel = data.player.achievements.skyblock_sb_levels ?? 0;
        return {nwLevel: hypixelNetworkLevel, bwStar: hypixelBedwarsStar, swStar: hypixelSkywarsStar, sbLevel: hypixelSkyblockLevel};
    }
    catch (error){
        console.log("Error:", error);
        return {nwLevel: 0, bwStar: 0, swStar: 0, sbLevel: 0};
    }
}

module.exports = {
    returnPlayerInfo
}