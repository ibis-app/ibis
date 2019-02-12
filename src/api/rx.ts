import express from 'express'
import config from './config'
import file from './file'

const router = express.Router()

router.get('/', (_, res: express.Response) => {
    res.send('rx')
})

router.use('/file', file({
    endpoint: 'rx',
    absoluteFilePath: config.relative.ibisRoot('system', 'rx')
}))

export default router
