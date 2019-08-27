#!/bin/sh

if [ -z "$1" ]
then
 echo Missing tag number
 exit -1;
fi

docker build -t scbd/cctv:$1 git@github.com:scbd/cctv.git && \
docker push scbd/cctv:$1
