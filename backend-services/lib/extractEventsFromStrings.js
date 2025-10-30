const OpenAI = require('openai');
const secrets = require('../../secrets/secrets.json');
const {map, path, pipe, prop} = require('ramda');
const {gptEventsCallbackFunction} = require("./gptEventsCallbackFunction");


const openai = new OpenAI({
    apiKey: secrets.openai,
    organization: 'org-Jm9R3zUcqBMp6rcMHD4bdKHH',
});

const functions = [
    gptEventsCallbackFunction
]

const moment = require('moment');

module.exports = {
    extractEventsFromStrings: pipe(
        map(v => `"${v}"\n`),
        v => openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {role: "system", "content": "You are helpful events from text extractor"},
                {
                    role: "user",
                    "content": `From following strings extract events and run proper callback function.
                    Please remember that dateAndTime of the event should be in this format 'YYYY-MM-DDTHH:mm:ss'.
                    Assume that today is ${moment().format('YYYY-MM-DD, dddd')}, this is really important for extracting date.
                    IMPORTANT: Don't miss any event! Unless there's a duplicate (check by event url) if yes skip duplicate, we want just one occurrence of each event.
                    Also for every event decide about a category, one from ['music', 'film', 'health', 'art', 'theater', 'other'] \n\n ${v}`
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

                return []
            }),
    )
}