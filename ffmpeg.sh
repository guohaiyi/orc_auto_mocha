#!/bin/bash

#e.g. ffmpeg -re -i /root/output.flv -c copy -f flv rtmp://172.17.1.50:5025/live/live1

input_file=$1
stream_link=$2
#while :
#do
ffmpeg -re -i ${input_file} -c copy -f flv ${stream_link}
#done