import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors({
    origin: process.env.FRONTEND
  }))
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('/')
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})