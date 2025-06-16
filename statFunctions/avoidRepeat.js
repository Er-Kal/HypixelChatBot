var config = require("../config.json");

// Fetch random messages from config
// Used to bypass repeated messages
const messages = config.messages;


iter = 0;

// Iterates through array to use next string
async function avoidRepeatString(){
    iter++;
    if (iter+1>messages.length){
        iter=0;
    }
    return messages[iter];
}

module.exports= {
    avoidRepeatString
};