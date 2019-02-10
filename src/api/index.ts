import express from 'express'
import rx from './rx'

var router = express.Router()

router.get('/rx', rx)

export default router