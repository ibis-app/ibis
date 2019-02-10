import express from 'express'
import config from './config'
import path from 'path'
import fs from 'fs'
import { isEmpty } from 'lodash'
import { getModality, parseHeader, parseHeaderFromFile } from './common'
import { filter } from 'minimatch';

const router = express.Router()

const rxPath = config.paths.rx

router.get('/:modality/:treatment', (req: express.Request, res: express.Response) => {
    const {
        modality,
        treatment
    } = req.params;

    res.sendFile(path.join(rxPath, modality, treatment))
});


router.get('/:modality/:treatment/info', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {
        modality,
        treatment
    } = req.params;

    fs.readFile(path.join(rxPath, modality, treatment), async (err, data) => {
        if (err) {
            next(err)
        }

        const interestingNode = await parseHeader(data)

        console.dir(interestingNode)

        const [
            version,
            _,
            tag,
            name,
            category
        ] = interestingNode;

        res.send({
            modality: modality,
            treatment: treatment,
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

router.get('/:modality', getListing, async (req: express.Request, res: express.Response) => {
    const {
        modality
    } = req.params

    const meta = await Promise.all(res.locals.listing
        .map(async (filename: string) => ({ 
            filename: filename,
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
