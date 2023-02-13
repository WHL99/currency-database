# Currency Database
## Task

Create a NodeJS project:

1. Get the currency rates from https://open.er-api.com/v6/latest
2. Store the result in the database (see notes below), only following data:
   - date and time of the request
   - rate for USD
   - rate for EUR
   - rate for GBP
   - rate for CNY
   
## Setup

- Clone this repo
- Open the file and start:

  ```bash
  cd currency-database
  ```
  First install all npm package and run it: 
  ```bash
  npm install
  npm start
  ```
## Folder Structure
  ```
  currency-database
    │   README.md
    │   index.js
    │   app.js  
    │   currency.db 
    │   package.json 
    │   ...  
  ```
- ```index.js``` is for setting up an Express web server on a port and logs a message when the server starts successfully.
- ```app.js``` is the main file which fetches the latest currency exchange rates from an external API, stores them in a SQLite database, retrieves the stored datas.
- ```currency.db``` is a SQLite database that is used to store currency exchange rates and time.
- ```package.json``` lists all the dependencies and scripts needed to run the React app successfully.


