const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 4000
const test = require('./routes/test')
const pict = require('./routes/pict')
const letters = require('./routes/letters')

app.use(bodyParser.json())

app.use('/pict', pict);
app.use('/test', test);
app.use('/letters', letters);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})