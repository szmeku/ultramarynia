const { spawn } = require("child_process");

spawn("bash", ["-c", "cd /home/szmeku/projects/ultramarynia && ./scrap_and_rebuild.sh"], {
    stdio: "inherit"
});
