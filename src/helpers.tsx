import exhbs from 'express-hbs'
import fs from 'fs'
import path from 'path'
import config from './api/config'
import { port, hostname } from './config'
import axios from 'axios'

const readFile = (root: string) => (filename: string, cb: Function) => {
    fs.readFile(path.join(root, filename), 'utf8', function (err, content) {
        if (err) {
            console.error(err)
            cb()
        } else {
            cb(new exhbs.SafeString(content));
        }
    });
}

const menuItems: {
    destination: string,
    displayName: string
}[] = [
    {
        destination: '/',
        displayName: 'Home'
    },
    {
        destination: '/therapeutics',
        displayName: 'Therapeutics'
    },
    {
        destination: '/materia-medica',
        displayName: 'Materia Medica'
    },
    {
        destination: '/contact',
        displayName: 'Contact'
    },
    {
        destination: '/source',
        displayName: 'Source'
    },
]

exhbs.registerAsyncHelper('menu', (context: any, cb: Function) => {
    const {
        data: {
            root: {
                title
            }
        }
    } = context

    exhbs.cacheLayout('dist/views/partials/menu', true, (err: any, layouts: any[]) => {
        const [
            menuLayout
        ] = layouts;

        const s = menuLayout({
            items: menuItems.map(item => ({
                style: item.displayName === title ? 'active': '',
                ...item
            }))
        })

        console.log(s)

        cb(s)
    });
})

exhbs.registerAsyncHelper('readFile', readFile(config.paths.applicationRoot))
exhbs.registerAsyncHelper('readIFile', readFile(config.paths.ibisRoot))

exhbs.registerAsyncHelper('api', function (endpoint: string, cb: Function) {
    const absolutePath = `http://${hostname}:${port}/api/${endpoint}`
    axios.get(absolutePath)
        .then((response) => {
            cb(new exhbs.SafeString(JSON.stringify(response.data)));
        })
        .catch((err) => {
            console.log(`api err on endpoint '${err.request.path}': ${err.response.status}`)
            cb()
        })
});