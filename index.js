const express = require('express')
const app = require('./app')
const PORT = 5005

app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`)
}) 
