1. run crontab -e and put it there
```bash
00 15 * * * cd /home/szmeku/projects/ultramarynia/backend-services && /usr/local/bin/node start-scraper.js | logger -t katokult 
```

2. debug 
```bash
sudo tail -f /var/log/syslog                                                                                                ✓✗ main:9a63d73 - ultramarynia 
```

