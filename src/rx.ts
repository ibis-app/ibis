import express from 'express'
import config from './config'
import path from 'path'

const router = express.Router()

const rxPath = config.paths.rx

router.get('/', (_, res: express.Response) => {
    res.sendFile(path.join(rxPath, 'ACUP', 'Acupunct.htm'))
});

export default router
