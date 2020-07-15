# Heroku

## Useful Commands

```
heroku login
heroku apps:create ethquad
heroku config:set \
  KEY1=VALUE \
  KEY2=VALUE
heroku ps:scale web=1:free
heroku ps:scale web=2:standard-2x
heroku ps
heroku open
heroku logs --tail
heroku restart
heroku ps:stop web
```
