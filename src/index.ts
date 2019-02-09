import express from 'express'
import cors from 'cors'
import rx from './rx'

const port = 3000
const hostname = 'localhost'

let app = express()

app.get("/", (_, res: express.Response) => {
    res.send("Hello world!")
})

app.use(cors())

app.use('/rx', rx)

app.listen(port, hostname, () => {
    console.log(`Listening on http://${hostname}:${port}`)
})