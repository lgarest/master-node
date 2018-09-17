Test the server with the following curl commands
==

Default endpoints

- Ping
  ```
  curl\
    --header 'Content-Type: application/json'\
    localhost:3000/ping
  ```
  `< 200: {}`


- Hello world
  ```
  curl\
    --header 'Content-Type: application/json'\
    --data '{}'\
    localhost:3000/hello
  ```
  `< 200: {"msg":"Hello world!"}`

- 404
  ```
    curl\
      --header 'Content-Type: application/json'\
      --data '{ "enjoying": "the course" }'\
      localhost:3000/inexistent
  ```
  `< 404: {}`

REST endpoints

+ Users

  **POST** request
  ```
  curl\
   --header 'Content-Type: application/json'\
   --data '{"firstName":"Luis","lastName":"G","phone":"0123456789","password":"hello","tosAgreement":true}'\
   localhost:3000/users
  ```
  ```
  < 200: {
    "firstName": "Luis",
    "lastName": "G",
    "phone": "0123456789",
  }

  ```

  **GET** request
  ```
  curl\
   --header 'Content-Type: application/json'\
   localhost:3000/users?phone=0123456789
  ```
  ```
  < 200: {
    "firstName": "Luis",
    "lastName": "G",
    "phone": "0123456789",
  }
  ```

  **PUT** request
  ```
  curl\
   --request PUT\
   --header 'Content-Type: application/json'\
   --data '{"lastName":"Garcia","phone": "0123456789"}'\
   localhost:3000/users
  ```
  ```
  < 200: {}
  ```

  **DELETE** request
  ```
  curl\
   --request DELETE\
   localhost:3000/users?phone=0123456789
  ```
  `< 200: {}`
