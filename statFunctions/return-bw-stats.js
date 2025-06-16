const {returnHypixelStats} = require("./return-hypixel-stats.js");
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

        totalWins = (bedwarStats.eight_one_wins_bedwars ?? 0)+
        (bedwarStats.eight_two_wins_bedwars ?? 0)+
        (bedwarStats.four_four_wins_bedwars ?? 0)+
        (bedwarStats.four_three_wins_bedwars ?? 0);

        totalLosses = (bedwarStats.eight_one_losses_bedwars ?? 0)+
        (bedwarStats.eight_two_losses_bedwars ?? 0)+
        (bedwarStats.four_four_losses_bedwars ?? 0)+
        (bedwarStats.four_three_losses_bedwars ?? 0);

        // bedwarsWins = bedwarStats.wins_bedwars || 0;
        // bedwarsLosses = bedwarStats.losses_bedwars || 1;

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
    returnBWStats,
}