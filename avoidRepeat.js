var fs = require("fs");

const data = fs.readFileSync("./avoidRepeatMessages.json");
const messages = JSON.parse(data).messages;


iter = 0;


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