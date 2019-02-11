import express from 'express'
import rx from './rx'
import { requestLogger } from '../common'

var app = express()

app.use(requestLogger)

app.get('/', (_, res: express.Response) => {
    res.send('API')
})

app.use('/rx', rx)

export default app