import express from 'express'
import config from './config'
import file from './file'

const router = express.Router()

router.get('/', (_, res: express.Response) => {
    res.send('tx')
})

router.use('/file', file(config.relative.ibisRoot('system', 'tx')))

export default router
