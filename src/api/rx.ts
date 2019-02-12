import express from 'express'
import config from './config'
import path from 'path'
import fs from 'fs'
import { isEmpty } from 'lodash'
import { getModality, parseHeader, parseHeaderFromFile } from '../common'
import { parse, HTMLElement } from 'node-html-parser'
import { NextFunction } from 'connect';

const router = express.Router()

const rxPath = config.paths.rx

router.get('/', (_, res: express.Response) => {
    res.send('rx')
})

router.get('/file/:modality/:treatment', (req: express.Request, res: express.Response, next: NextFunction) => {
    const {
        modality,
        treatment
    } = req.params;

    fs.readFile(path.join(rxPath, modality, treatment), (err, data) => {
        if (err) next(err)

        const root = parse(data.toString(), { noFix: false })

        const body = root.childNodes.find(node => node instanceof HTMLElement)

        res.type('html')
        res.send(body.toString())
    })
});

function resolved(req: express.Request, endpoint: string): ({ relative: string, absolute: string }) {
    return {
        relative: endpoint,
        absolute: `${req.protocol}://${req.headers.host}/${endpoint}`
    };
}

const filepath = (req: express.Request, modality: string, filename: string) => resolved(req, `rx/file/${modality}/${filename}`)

router.get('/file/:modality/:filename/info', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {
        modality,
        filename
    } = req.params;

    fs.readFile(path.join(rxPath, modality, filename), async (err, data) => {
        if (err) {
            next(err)
        }

        const interestingNode = await parseHeader(data)

        const [
            version,
            _,
            tag,
            name,
            category
        ] = interestingNode;

        res.send({
            modality: modality,
            filename: filename,
            filepath: filepath(req, modality, filename),
            version: version,
            tag: tag,
            name: name,
            category: category
        })
    })
});

const getListing: express.RequestHandler = (req, res, next) => {
    const {
        modality
    } = req.params;

    let p: string;

    if (modality) {
        p = path.join(rxPath, modality)
    } else {
        p = rxPath;
    }

    fs.readdir(p, (err, items) => {
        if (err) {
            return next(err)
        }

        res.locals.listing = items
        next()
    })
}

router.get('/file/:modality', getListing, async (req: express.Request, res: express.Response) => {
    const {
        modality
    } = req.params

    const meta = await Promise.all(res.locals.listing
        .map(async (filename: string) => ({ 
            filename: filename,
            filepath: filepath(req, modality, filename),
            info: await parseHeaderFromFile(path.join(rxPath, modality, filename)),
        })))

    const empty = meta.filter((infoObject: any) => isEmpty(infoObject.info) || Object.values(infoObject.info).some(val => typeof val === 'undefined'))

    res.send({
        modality: {
            code: modality,
            ...getModality(modality)
        },
        meta: meta,
        empty: empty
    })
})

export default router
