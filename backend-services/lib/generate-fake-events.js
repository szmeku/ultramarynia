const OpenAI = require('openai');
const secrets = require('../../secrets.json');
const {map, path, pipe, prop} = require('ramda');


const openai = new OpenAI({
    apiKey: secrets.openai,
});


const functions = [
    {
        "name": "generated_events_callback",

        "description": "Get the current weather in a given location",
        "parameters": {
            "type": "object",
            "required": ["events"],
            "properties": {
                "events": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["dateAndTime", "city", "venue", "title", "description", "category", "url"],
                        "properties": {
                            "dateAndTime": {
                                "type": "string",
                                "description": "timestamp"
                            },
                            "city": {
                                "type": "string",
                                "description": "city where event happens"
                            },
                            "venue": {
                                "type": "string",
                                "description": "name of the venue where event happens"
                            },
                            "title": {
                                "type": "string"
                            },
                            "description": {
                                "type": "string"
                            },
                            "category": {
                                "type": "string"
                            },
                            "url": {
                                "description": "url to the event",
                                "type": "string"
                            }
                        }
                    }
                },
            },
        },
    }
]

module.exports = {
    generateFakeEvents: pipe(
        map(v => `"${v}"\n`),
        v => openai.chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: [
                {role: "system", "content": "You are helpful fake events generator"},
                {
                    role: "user",
                    "content": `Generate fake list of 50 events for coming week, response in json with structure
                        this fake city has limited number of venues so they should repeat for different events. There have to be at least 10 different dates and 4 events per date.`
                },
            ],
            functions,
            function_call: {name: "generated_events_callback"},
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