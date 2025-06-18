const {returnHypixelStats} = require("./return-hypixel-stats.js");
// CALC BW STATS

const modes = {
    "core": "core",
    "solo": "eight_one_",
    "duo": "eight_two_",
    "three": "four_three_",
    "four": "four_four_",
    "overall": "",
    "fvf": "two_four_"
}

async function returnBWStatsDefunct(user){
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

async function returnBWStats(user,mode){
    try{
        data = await returnHypixelStats(user);
        dpName = data.player.displayname;
        bedwarStats = data.player.stats?.Bedwars;
        bedwarsStar = data.player.achievements.bedwars_level;

        let totalStats;
        if (mode==="core"){
            overall = await returnRawStats(bedwarStats, modes["overall"]);
            fvf = await returnRawStats(bedwarStats, modes["fvf"]);
            
            totalStats = {
                totalFinalKills: overall.finalKills - fvf.finalKills,
                totalFinalDeaths: overall.finalDeaths - fvf.finalDeaths,
                totalWins: overall.wins - fvf.wins,
                totalLosses: overall.losses - fvf.losses,
                totalBedsLost: overall.bedsLost - fvf.bedsLost,
                totalBedsBroken: overall.bedsBroken - fvf.bedsBroken
            };
        }
        else{
            const modeData = await returnRawStats(bedwarStats, modes[mode]);
            totalStats = {
                totalFinalKills: modeData.finalKills,
                totalFinalDeaths: modeData.finalDeaths,
                totalWins: modeData.wins,
                totalLosses: modeData.losses,
                totalBedsLost: modeData.bedsLost,
                totalBedsBroken: modeData.bedsBroken
            };
        }

        finalKillRatio = ((totalStats.totalFinalKills || 1)/(totalStats.totalFinalDeaths || 1)).toFixed(2);
        bedBrokenRatio = ((totalStats.totalBedsBroken || 1)/(totalStats.totalBedsLost || 1)).toFixed(2);
        winLossRatio = ((totalStats.totalWins || 1)/(totalStats.totalLosses || 1)).toFixed(2);
        
        return {display: dpName, finals: finalKillRatio, beds: bedBrokenRatio, star: bedwarsStar, wlr: winLossRatio};
    }
    catch(error){
        console.error("ERROR:",error);
        return {display: user, finals: 0, beds: 0, star: 0, wlr:0};
    }
}

async function returnRawStats(data,modePrefix){
    try{
        finalKills = (bedwarStats[`${modePrefix}final_kills_bedwars`] ?? 0);
        finalDeaths = (bedwarStats[`${modePrefix}final_deaths_bedwars`] ?? 0);
        wins = (bedwarStats[`${modePrefix}wins_bedwars`] ?? 0);
        losses = (bedwarStats[`${modePrefix}losses_bedwars`] ?? 0);
        bedsLost = (bedwarStats[`${modePrefix}beds_lost_bedwars`] ?? 0);
        bedsBroken = (bedwarStats[`${modePrefix}beds_broken_bedwars`] ?? 0);

        return {finalKills, finalDeaths, wins, losses, bedsLost, bedsBroken};
    }
    catch (error){
        console.error("ERROR:",error);
        return {finalKills:0, finalDeaths:0, bedsBroken:0, bedsLost:0, wins:0, losses:0};
    }
}

module.exports = {
    returnBWStats,
}