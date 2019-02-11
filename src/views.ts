import express from 'express'

var router: express.Router = express.Router()

router.get("/", (_, res: express.Response) => {
    res.render('home', {
        title: 'Home'
    })
})

export default router