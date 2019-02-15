import express from 'express'
import config from './api/config'
import path from 'path'
import browserify from 'browserify'

let router: express.Router = express.Router()

let b = browserify()
b.add('./dist/public/scripts/app.js')

router.get('/scripts/main.js', (_, res, next) => {
    b.bundle((err, src) => {
        if (err) {
            console.error('failed to send bundle')
            next(err)
            return
        }

        res.type('script')
        res.send(src.toString())
    })
})

router.get('/favicon.ico', (_, res) => {
    res.sendFile(config.relative.ibisRoot('system', 'rsrcs', '32IBIS3.ico'))
})

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