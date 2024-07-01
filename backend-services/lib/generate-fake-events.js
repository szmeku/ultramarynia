const OpenAI = require('openai');
const secrets = require('../../secrets/secrets.json');
const {map, path, pipe, prop} = require('ramda');
const {gptEventsCallbackFunction} = require("./gptEventsCallbackFunction");


const openai = new OpenAI({
    apiKey: secrets.openai,
});


const functions = [
    gptEventsCallbackFunction
]

module.exports = {
    generateFakeEvents: pipe(
        map(v => `"${v}"\n`),
        v => openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", "content": "You are helpful fake events generator"},
                {
                    role: "user",
                    "content": `Generate fake list of 30 events for coming week, response in json with structure
                        this fake city has limited number of venues so they should repeat for different events. There have to be at least 4 different dates and 4 events per date.`
                },
            ],
            functions,
            function_call: {name: gptEventsCallbackFunction.name},
            // could be function_call: "auto" to let ai decide which function to call

        })
            .then(path(['choices', 0, 'message', 'function_call', 'arguments']))
            .then(v => JSON.parse(v))
            .then(prop('events'))
            .catch((error) => {
                console.log(error);
            }),
    )
}