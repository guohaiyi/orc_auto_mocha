#!/usr/bin/expect
set username "root"
set password "omgtest"
set hosts "172.16.1.215"
spawn ssh  $username@$hosts
expect "$username@$hosts's password:"
send -- "$password\n"
expect "#"
send -- "service docker stop\n"