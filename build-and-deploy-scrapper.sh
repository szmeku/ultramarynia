#!/bin/bash

git pull origin
docker build -f docker-images/Dockerfile-scraper -t katokult-scrapper .
docker save -o katokult-scrapper.tar katokult-scrapper
scp katokult-scrapper.tar ubuntu@54.36.111.73:~/
ssh ubuntu@54.36.111.73 'docker load -i katokult-scrapper.tar'
