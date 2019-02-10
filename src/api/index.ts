import express from 'express'
import rx from './rx'

var router = express.Router()

router.get('/', (_, res: express.Response) => {
    res.send('API')
})

router.use('/rx', rx)

export default router