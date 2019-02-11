import express from 'express'

var router: express.Router = express.Router()

router.get("/", (_, res: express.Response) => {
    res.render('home')
})

export default router