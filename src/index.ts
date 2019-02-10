import express from 'express'
import cors from 'cors'
import path from 'path'
import api from './api'
import express_handlebars from 'express-handlebars'

const port = parseInt(process.env['PORT']) || 3000
const hostname = process.env['localhost'] || 'localhost'

let app = express()

app.engine('.hbs', express_handlebars({
    'defaultLayout': 'main',
    'extname': 'hbs',
    'layoutsDir': 'dist/views/layouts',
    'partialsDir': 'dist/views/partials'
}))
app.set('views', 'dist/views')

app.set('view engine', '.hbs')

app.get("/", (_, res: express.Response) => {
    res.render('index', {
        title: 'asdf'
    })
})

app.get("/semantic.min.js", (_, res: express.Response) => {
    res.sendFile(path.join(__dirname, '..', 'semantic', 'dist', 'semantic.min.js'))
})

app.get("/semantic.min.css", (_, res: express.Response) => {
    res.sendFile(path.join(__dirname, '..', 'semantic', 'dist', 'semantic.min.css'))
})

app.use(cors())

app.use('/api', api)

if (process.env["NODE_ENV"] === 'production') {
    app.enable('view cache')
} else {
    app.disable('view cache')
}

app.listen(port, hostname, () => {
    console.log(`Listening on http://${hostname}:${port}`)
})