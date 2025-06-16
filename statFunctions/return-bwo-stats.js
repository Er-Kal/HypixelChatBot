
const {returnHypixelStats} = require("./return-hypixel-stats.js");
// CALC BW INCLUDING FVF STATS
async function returnBWOStats(user){
    try{
        data = await returnHypixelStats(user);
        dpName = data.player.displayname;
        bedwarStats = data.player.stats?.Bedwars;
        bedwarsStar = data.player.achievements.bedwars_level;

        totalFinalKills = (bedwarStats.final_kills_bedwars ?? 0);

        totalFinalDeaths = (bedwarStats.final_deaths_bedwars ?? 0);

        totalBedsBroken = (bedwarStats.beds_broken_bedwars ?? 0);

        totalBedsLost = (bedwarStats.beds_lost_bedwars ?? 0);

        totalWins = (bedwarStats.wins_bedwars ?? 0);

        totalLosses = (bedwarStats.losses_bedwars ?? 0);

        fkdr = ((totalFinalKills || 1)/(totalFinalDeaths || 1)).toFixed(2);
        bblr = ((totalBedsBroken || 1)/(totalBedsLost || 1)).toFixed(2);
        winLoss = ((totalWins || 1)/(totalLosses || 1)).toFixed(2);
        
        return {display: dpName, finals: fkdr, beds: bblr, star: bedwarsStar, wlr: winLoss};
    }
    catch(error){
        console.error("ERROR:",error)
        return {display: user, finals: 0, beds: 0, star: 0, wlr:0};
    }
}

module.exports = {
    returnBWOStats,
}