#!/bin/bash
service docker stop
service docker start
export cid=$(docker ps -a| awk '{print $1}' |grep -v CONTAINER)
docker start $cid
docker exec $cid bash -c "
cd /opt/onwardsmg/omp/omp-config-script;
chmod 755 *.sh;
./run_omp.sh 8888;"