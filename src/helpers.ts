import exhbs from 'express-hbs'
import fs from 'fs'
import path from 'path'
import config from './api/config'
import { menuItems } from './views'
import { apiHostname } from './api/config'
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

export const fetchFromAPI = (endpoint: string, cb: (data?: any)=>any) => {
    const absolutePath = `${apiHostname}/${endpoint}`
    axios.get(absolutePath)
        .then((response) => {
            cb(response.data)
        })
        .catch((err) => {
            console.log(`api err on endpoint '${err.request.path}': ${err.response.status}`)
            cb()
        })
};

exhbs.registerAsyncHelper('menu', (context: any, cb: Function) => {
    const {
        data: {
            root: {
                destination
            }
        }
    } = context

    exhbs.cacheLayout('dist/views/partials/menu', true, (err: any, layouts: any[]) => {
        const [
            menuLayout
        ] = layouts;

        const s = menuLayout({
            items: menuItems.map(item => ({
                ...item,
                style: item.destination === destination ? 'active': '',
                destination: item.external ? item.destination : `/${item.destination}`
            }))
        })

        cb(s)
    });
})

exhbs.registerAsyncHelper('file', readFile(config.paths.applicationRoot))
exhbs.registerAsyncHelper('ibis_file', readFile(config.paths.ibisRoot))

exhbs.registerAsyncHelper('api', (context: any, cb: Function) => {
    console.log('fetching from helper')
    fetchFromAPI(context.hash.endpoint, (data) => cb(new exhbs.SafeString(data)))
})

exhbs.registerHelper('hostname', (route: any) => {
    if (route === 'api') {
        return apiHostname;
    }
})

exhbs.registerHelper('json', (data: any) => {
    return JSON.stringify(data)
})

const whitespace = /\s+/

exhbs.registerHelper('title_case', (s: string) => {
    if (typeof s !== 'string') return s;

    return s
        .split(whitespace)
        .map(segment => segment.charAt(0).toLocaleUpperCase() + segment.slice(1))
        .join(' ')
})