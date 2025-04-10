async function returnHypixelStats(user){
    try{
        response = await fetch(`https://api.hypixel.net/player?key=${process.env.HYPIXELKEY}&name=${user}`)
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
module.exports ={
    returnHypixelStats,
}