#!/bin/bash

docker run --rm -v ./sessions:/app/sessions -v ./data:/app/data -v ./backend-services:/app/backend-services -v ./secrets:/app/secrets/ katokult-scraper node ./backend-services/start-scraper.js