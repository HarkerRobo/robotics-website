#!/bin/bash

sudo pm2 restart robo
sudo service nginx restart
sudo pm2 restart robo
sudo pm2 logs robo
