import express from 'express'
import config from './api/config'
import path from 'path'

let router: express.Router = express.Router()

// if this 404s, make sure to build fomantic-ui
router.use('/semantic', express.static(path.join(config.paths.applicationRoot, 'semantic', 'dist')))

export default router