

wsl でアクセスできるようにする方法
linux側
```/etc/hosts
127.0.0.1 local-misskey.local
```
windows側
```C:\Windows\System32\drivers\etc\hosts
127.0.0.1  local-misskey.local
```
どっちも編集したらmisskeyをブラウザとかからアクセスできるようになる




```bash 
# dump misskey sql 
docker exec mi-deck-misskey-db-1 pg_dumpall -c -U example-misskey-user  > db_dump/dump.sql 
docker compose exec misskey-db pg_dumpall -c -U example-misskey-user  > db_dump/dump.sql

#  restore misskey db

docker volume rm  mi-deck_misskey-db-1
docker-compose up -d misskey-db
cat db_dump/dump.sql | docker-compose exec --no-TTY misskey-db psql misskey example-misskey-user
```

# misskey local info
```
url: http://localhost:3002
user: @hoge
pass: hoge
```
