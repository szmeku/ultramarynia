
const gptEventsCallbackFunction = {
    "name": "generated_events_callback",
    "description": "Takes events extracted from text",
    "parameters": {
        "type": "object",
        "required": ["events"],
        "properties": {
            "events": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["dateAndTime", "city", "venue", "title", "description", "category"],
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
                    }
                }
            },
        },
    },

}

module.exports = {
    gptEventsCallbackFunction
};