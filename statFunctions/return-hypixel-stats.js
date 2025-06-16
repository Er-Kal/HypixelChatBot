const NodeCache = require('node-cache');

var config = require("../config.json");

// Cache for user data
const cache = new NodeCache({stdTTL:600});

// Fetches hypixel data
async function fetchHypixelStats(user){
    try{
        response = await fetch(`https://api.hypixel.net/player?key=${config.hypixelAPIKey}&name=${user}`)
        data = await response.json();
        if (!data.success){
            if (data.cause==="You have already looked up this name recently"){
                console.log("Already Checked")
            }else{
                console.error("ERROR:",data.cause);
            }
            return data;
        }
        else{
            return data;
        }
    }
    catch (error){
        console.error("ERROR", error);
        
    }
    return "womp womp";
}

// Function to return hypixel stats
// If user exists in cache, return from cache, else fetch from Hypixel API.
async function returnHypixelStats(user){
    try{
        data = cache.get(user);
        if (data==null){
            data = fetchHypixelStats(user);
            cache.set(user, data, 120);
        }
        return data;
    }
    catch(error){
        console.error("Error:",error)
    }
}
module.exports ={
    returnHypixelStats,
}