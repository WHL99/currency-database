const express = require('express')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))
const app = express()
const sqlite3 = require('sqlite3').verbose()
const ExternalAPI = 'https://open.er-api.com/v6/latest'

const createDatabase = () => {
  const db = new sqlite3.Database(
    'currency.db',
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) console.error(err.message)
    },
  )
  return db
}

const createTable = (db) => {
  const query = `CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_at TEXT NOT NULL,
      rate_USD REAL NOT NULL,
      rate_EUR REAL NOT NULL,
      rate_GBP REAL NOT NULL,
      rate_TWD REAL NOT NULL
  )`
  db.run(query, (err) => {
    if (err) console.error(err.message)
  })
}

const fetchExchangeRates = async () => {
  return fetch(ExternalAPI)
    .then((res) => res.json())
    .catch((err) => {
      console.error(err)
      throw new Error('Failed to fetch exchange rates')
    })
}

const insertExchangeRatesAndTimeIntoDB = async (db, rates) => {
  try {
    const requestAt = new Date().toLocaleString()
    const { USD, EUR, GBP, TWD } = rates
    const query = `INSERT INTO results(request_at, rate_USD, rate_EUR, rate_GBP, rate_TWD) VALUES (?,?,?,?,?)`
    const params = [requestAt, USD, EUR, GBP, TWD]
    await db.run('BEGIN')
    await db.run(query, params)
    await db.run('COMMIT')
  } catch (err) {
    console.error(err)
    throw new Error('Failed to insert exchange rates into the database')
  }
}

const retrieveExchangeRatesFromDB = async (db) => {
  const rows = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM results`, [], (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
  rows.forEach((row) => console.log(row))
}

const closeDB = (db) => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(new Error('Failed to close the database'))
      resolve()
    })
  })
}

app.get('/', async (req, res) => {
  try {
    const db = createDatabase()
    createTable(db)
    const exchangeRates = await fetchExchangeRates()
    await insertExchangeRatesAndTimeIntoDB(db, exchangeRates.rates)
    await retrieveExchangeRatesFromDB(db)
    await closeDB(db)
    res.json({ status: 200, success: true })
  } catch (err) {
    console.error(err)
    res.status(500).send('Something went wrong...')
  }
})

module.exports = app
