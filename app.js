const express = require('express')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const app = express()
const sqlite3 = require('sqlite3').verbose()
const ExternalAPI = 'https://open.er-api.com/v6/latest'

const db = new sqlite3.Database(
    'currency.db',
    sqlite3.OPEN_READWRITE,
    (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('currency.sqlite is connected!')
    }
)

db.run(
    `CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_at TEXT NOT NULL,
    rate_USD REAL NOT NULL,
    rate_EUR REAL NOT NULL,
    rate_GBP REAL NOT NULL,
    rate_CNY REAL NOT NULL
  )`,
    (err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Table "results" has been created or already exists.')
    }
);

const fetchExchangeRates = async () => {
    try {
        const res = await fetch(ExternalAPI)
        const data = await res.json()
        return data
    } catch (err) {
        console.error(err)
        throw new Error('Failed to fetch exchange rates')
    }
}

const insertExchangeRatesAndTimeIntoDB = async (db, rates) => {
    try {
        const requestAt = new Date().toLocaleString()
        const { USD, EUR, GBP, CNY } = rates
        const query = `INSERT INTO results(request_at, rate_USD, rate_EUR, rate_GBP, rate_CNY) VALUES (?,?,?,?,?)`
        const params = [requestAt, USD, EUR, GBP, CNY]
        return new Promise((resolve, reject) => {
            db.run(query, params, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    } catch (err) {
        console.error(err)
        throw new Error('Failed to insert exchange rates into the database')
    }
}

const retrieveExchangeRatesFromDB = (db) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM results`, [], (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const closeDB = (db) => {
    return new Promise(() => {
        db.close((err) => {
            if (err) return console.error(err.message)
        })
    })
}

app.get('/', async (req, res) => {
    try {
        const exchangeRates = await fetchExchangeRates()
        await insertExchangeRatesAndTimeIntoDB(db, exchangeRates.rates)
        const retrievedRates = await retrieveExchangeRatesFromDB(db)
        console.log(retrievedRates)
        res.json({ status: 200, success: true });
        closeDB(db);
    } catch (err) {
        console.error(err)
        res.status(500).send('Something went wrong...')
    }
})

module.exports = app 