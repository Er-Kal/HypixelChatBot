strings = ["discord.gg/shadeop",
"maybe touch some grass",
":-):-):-):-)", 
"shade#1",
"dontaskabthis",
"❀❇✳✴✴✴✳❇❀",
"we love hypixel",
"(╯°□°)╯︵ ┻━┻",
"stay hydrated",
`no kizzy (slang for "no cap")`,
"get that gexp",
"tick tick tick tick"];

iter = 0;

async function avoidRepeatString(){
    iter++;
    if (iter+1>strings.length){
        iter=0;
    }
    return strings[iter];
}

module.exports= {
    avoidRepeatString
};