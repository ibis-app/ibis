import express from 'express'
import config from './api/config'
import path from 'path'

let router: express.Router = express.Router()

// if this 404s, make sure to build fomantic-ui
router.get('/semantic/:asset', (req: express.Request, res: express.Response) => {
    const {
        asset
    } = req.params

    res.sendFile(path.join(config.paths.applicationRoot, 'semantic', 'dist', asset))
})

export default router