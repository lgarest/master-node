# Test the server with the following curl commands

## ENV variables
```bash
export API=localhost:3000
export TOKEN=3pvzourve7v8k8i2k6vv
export PHONE=0121000000
```

## Default endpoints

- Ping
  ```bash
  curl \
    --header 'Content-Type: application/json' \
    $API/ping
  ```
  ```js
  < 200: {}
  ```


- Hello world
  ```bash
  curl \
    --header 'Content-Type: application/json' \
    --data '{}' \
    $API/hello
  ```
  `< 200: {"msg":"Hello world!"}`

- 404
  ```bash
  curl \
    --header 'Content-Type: application/json' \
    --data '{ "enjoying": "the course" }' \
    $API/inexistent
  ```
  ```js
  < 404: {}
  ```

## REST endpoints

### Users

**POST** request
```bash
curl \
  --header 'Content-Type: application/json' \
  --data '{"firstName":"Edualdo","lastName":"El Goldo","phone":"0121000000","password":"hello","tosAgreement":true}' \
  $API/users
```
```js
< 200: {
  "firstName": "Luis",
  "lastName": "G",
  "phone": "0123456789",
}
```

**GET** request
```bash
curl \
  --header 'Content-Type: application/json' \
  --header 'token: $TOKEN' \
  $API/users?phone=0123456789
```
```js
< 200: {
  "firstName": "Luis",
  "lastName": "G",
  "phone": "0123456789",
}
```

**PUT** request
```bash
curl \
  --request PUT \
  --header 'Content-Type: application/json' \
  --header 'token: $TOKEN' \
  --data '{"lastName":"Garcia","phone": "0123456789"}' \
  $API/users
```
```js
< 200: {}
```

**DELETE** request
```bash
curl \
  --request DELETE \
  --header 'token: $TOKEN' \
  $API/users?phone=0123456789
```
```js
< 200: {}
```
---
### Tokens

**POST** request
```bash
curl \
  --header 'Content-Type: application/json' \
  --data '{"phone":"0123456789","password":"hello"}' \
  $API/tokens
```
```js
< 200: {
  "id":"8fvgomx7qqr05gbbeage",
  "phone":"0123456789",
  "expires":1543773407346
}
```

**GET** request
```bash
curl \
  --header 'Content-Type: application/json' \
  $API/tokens?id=$TOKEN
```
```js
< 200: {
  "id":"8fvgomx7qqr05gbbeage",
  "phone":"0123456789",
  "expires":1543773407346
}
```

**PUT** request
```bash
curl \
  --request PUT \
  --header 'Content-Type: application/json' \
  --data "{'id': '$TOKEN','extend': true}" \
  $API/tokens
```

**DELETE** request
```bash
curl \
  --request DELETE \
  $API/tokens?id=$TOKEN
```
```js
< 200: {}
```