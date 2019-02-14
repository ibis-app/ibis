import express from 'express'
import rx from './rx'
import tx from './tx'
import { requestLogger, modalities } from '../common'
import cors from 'cors'

var app = express()

app.use(cors())

app.use(requestLogger)

app.get('/', (_, res: express.Response) => {
    res.send('API')
})

app.get('/modalities', (_, res: express.Response) => {
    res.send(modalities)
})

app.use('/rx', rx)
app.use('/tx', tx)

export default app