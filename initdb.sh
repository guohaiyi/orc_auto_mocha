mongo tenant_master --eval 'db.dropDatabase()'
mongo autotest --eval 'db.dropDatabase()'
mongo autotestupdate --eval 'db.dropDatabase()'
pm2 start api
pm2 restart api