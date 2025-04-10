const {returnHypixelStats} = require("./returnHypixelStats.js")

async function returnSWStats(user){
    try{
        data = await returnHypixelStats(user);
        dpName = data.player.displayname;
        skywarsStar = data.player.achievements.skywars_you_re_a_star;
        skywarsData = data.player.stats.SkyWars;
        skywarsWins = (skywarsData.wins ?? 0);
        skywarsLosses = (skywarsData.losses || 1);

        skywarsKills = (skywarsData.kills ?? 0);
        skywarsDeaths = (skywarsData.deaths || 1);

        skywarsWLR = skywarsWins/skywarsLosses;
        skywarsKDR = skywarsKills/skywarsDeaths;

        return {display: dpName,star: skywarsStar, kdr: skywarsKDR.toFixed(2), wlr: skywarsWLR.toFixed(2), kills: skywarsKills, wins: skywarsWins};
    }
    catch (error){
        console.error("ERROR:",error);
    }
    return {display: user, star: 0, kdr:0, wlr:0, kills:0, wins:0};
}

module.exports = {
    returnSWStats,
}