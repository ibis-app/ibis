import express from 'express'
import rx from './rx'

var app = express()

app.get('/', (_, res: express.Response) => {
    res.send('API')
})

app.use('/rx', rx)

export default app