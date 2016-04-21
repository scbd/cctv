#!/bin/sh

docker build -t localhost:5000/cctv git@github.com:scbd/cctv.git

docker push localhost:5000/cctv
