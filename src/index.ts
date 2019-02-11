import express from 'express'
import cors from 'cors'
import path from 'path'
import exhbs from 'express-hbs'
import { port, hostname } from './config'
import api from './api'
import assets from './assets'
import views from './views'
import './helpers'

let app = express()

app.use(cors())

app.use((req: express.Request, res, next) => {
    console.log(JSON.stringify(
        {
            date: new Date(),
            path: req.path,
            query: req.query,
            'user-agent': req.headers['user-agent'],
        }))
    next()
})

app.engine('.hbs', exhbs.express4({
    'defaultLayout': path.join(__dirname, 'views', 'layouts', 'default'),
    'extname': '.hbs',
    'layoutsDir': 'dist/views/layouts',
    'partialsDir': 'dist/views/partials'
}))

app.set('views', 'dist/views')

app.set('view engine', '.hbs')

app.use('/', views)

app.use('/assets', assets)
app.use('/api', api)

if (process.env["NODE_ENV"] === 'production') {
    app.enable('view cache')
} else {
    app.disable('view cache')
}

app.listen(port, hostname, () => {
    console.log(`Listening on http://${hostname}:${port}`)
})