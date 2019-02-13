import express from 'express'
import config from './api/config'
import path from 'path'

let router: express.Router = express.Router()

router.use('/', express.static(path.join(config.paths.applicationRoot, 'dist', 'public'), {
    index: false,
    maxAge: '100000'
}))

// if this 404s, make sure to build fomantic-ui
router.use('/semantic', express.static(path.join(config.paths.applicationRoot, 'semantic', 'dist'), {
    index: false,
    setHeaders: (res) => {
        res.setHeader('Date', new Date().toString())
    }
}))

export default router