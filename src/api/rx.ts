import express from 'express'
import config from './config'
import file from './file'

const router = express.Router()

router.use('/', file({
    endpoint: 'rx',
    absoluteFilePath: config.relative.ibisRoot('system', 'rx'),
    trimLeftPattern: /definition/
}))

export default router
