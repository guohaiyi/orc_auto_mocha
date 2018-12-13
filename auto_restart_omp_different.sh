#!/usr/bin/expect
set username "root"
set password "omgtest"
set hosts "172.16.1.215"
spawn ssh  $username@$hosts
expect "$username@$hosts's password:"
send -- "$password\n"
expect "#"
send -- "service docker stop\n"
sleep 2
expect "#"
send -- "service docker start\n"
sleep 2
expect "#"
send -- "export cid=\$(docker ps -a\| awk '{print \$1}' \|grep -v CONTAINER)\n"
sleep 2
expect "#"
send -- "docker start \$cid\n"
sleep 2
expect "#"
send -- "docker exec \$cid bash -c \"\n"
sleep 2
expect ">"
send -- "cd /opt/onwardsmg/omp/omp-config-script;\n"
sleep 2
expect ">"
send -- "chmod 755 *.sh;\n"
sleep 2
expect ">"
send -- "./run_omp.sh 8888;\"\n"
sleep 2
expect "#"
send -- "exit\n"