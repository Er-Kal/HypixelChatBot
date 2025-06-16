const {returnHypixelStats} = require("./return-hypixel-stats.js")

// FETCH SB STATS FROM SOOPY
async function fetchSBStats(uuid){
    try{
        response = await fetch(`https://soopy.dev/api/v2/player_skyblock/${uuid}?networth=true`);
        data = await(response.json());
        if (!data.success){
            console.error("ERROR:",data.cause);
            return data;
        }
        else{
            return data;
        }
    }
    catch (error){
        console.log("ERROR:",error);
        return "";
    }
}

// RETURN SB STATS
async function returnSBStats(user){
    try{
        data = await returnHypixelStats(user);
        display = data.player.displayname;
        uuid = data.player.uuid;
        fetchedSBData = await fetchSBStats(uuid);
        currentProfileId = fetchedSBData.data.stats.currentProfileId;
        currentProfile = fetchedSBData.data.profiles[currentProfileId];
        member = currentProfile.members[uuid];
        console.log(member);
        networth = await formatNetworth(member.nwDetailed.networth);
        console.log(networth);
        skillAvg = member.skills.skillAvg.toFixed(0);
        console.log(skillAvg);
        sbLvl = member.sbLvl.toFixed(0);
        return {display: display, sbLvl: sbLvl, networth:networth,skillAvg:skillAvg};
    }
    catch (error){
        console.log("Error: ", error);
        return {display: user, sbLvl:0, networth:0, skillAvg:0};
    }
}

// FORMAT NETWORTH FOR OOM
async function formatNetworth(networth){
    if (networth>=1e12){ return (networth/1e12).toFixed(2)+"T" }
    if (networth>=1e9){  return (networth/1e9).toFixed(2)+"B" }
    if (networth>=1e6){  return (networth/1e6).toFixed(2)+"M" }
    if (networth>=1e3){  return (networth/1e3).toFixed(2)+"K" }
    return networth;
}

module.exports = {
    returnSBStats,
}