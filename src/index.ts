import express from 'express'
import cors from 'cors'
import api from './api'

const port = 3000
const hostname = 'localhost'

let app = express()

app.get("/", (_, res: express.Response) => {
    res.send("Hello world!")
})

app.use(cors())

app.use('/api', api)

app.listen(port, hostname, () => {
    console.log(`Listening on http://${hostname}:${port}`)
})