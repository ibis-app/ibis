import express from 'express'
import config from './config'
import path from 'path'
import fs from 'fs'
import { getModality, parseHeader } from './common'
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

        const interestingNodes = await parseHeader(data)

        res.send(interestingNodes.toString())
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

router.get('/:modality', getListing, (req: express.Request, res: express.Response) => {
    const {
        modality
    } = req.params

    res.send({
        modality: {
            code: modality,
            ...getModality(modality)
        },
        filenames: res.locals.listing
        })
})

export default router
