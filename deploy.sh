#!/bin/sh

docker build -t scbd/cctv git@github.com:scbd/cctv.git && docker push scbd/cctv
