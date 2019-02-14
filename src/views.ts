import express from 'express'
import path from 'path'
import { fetchFromAPI } from './helpers'

export const menuItems: {
    destination: string,
    title: string,
    external?: boolean,
    endpoint?: string,
    needs_modalities?: boolean
}[] = [
        {
            destination: '',
            title: 'Home'
        },
        {
            destination: 'therapeutics',
            title: 'Therapeutics',
            needs_modalities: true
        },
        {
            destination: 'materia-medica',
            title: 'Materia Medica',
            needs_modalities: true
        },
        {
            destination: 'contact',
            title: 'Contact'
        },
        {
            destination: 'https://github.com/benjspriggs/ibis',
            title: 'Source',
            external: true
        },
    ]

export const getMenuItemBy = {
    destination: (destination: string) => menuItems.find(item => item.destination === destination),
    title: (title: string) => menuItems.find(item => item.title === title)
}

var router: express.Router = express.Router()

router.get("/", (_, res: express.Response) => {
    res.render('home', getMenuItemBy.destination(''))
})

router.use('/:asset', express.static(path.join(__dirname, 'public')))

router.get("/:route", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {
        route
    } = req.params

    const item = getMenuItemBy.destination(route)

    if (typeof item === 'undefined') {
        next(new Error(`no such route found: ${route}`))
    }

    if (item.endpoint) {
        fetchFromAPI(item.endpoint, (data) => {
            res.render(route, ({ ...item, data: data }))
        })
    } else {
        res.render(route, item)
    }
})

export default router