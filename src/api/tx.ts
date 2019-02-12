import express from 'express'
import config from './config'
import file from './file'
import fs from 'fs'
import path from 'path'
import { parseHeaderFromFile, Header } from '../common';

const router = express.Router()

router.get('/', (_, res: express.Response) => {
    res.send('tx')
})

interface TreatmentListing {
    modality: string,
    treatments: Header[]
}

const allInfo = new Promise<TreatmentListing[]>((resolve, reject) => {
    fs.readdir(config.paths.tx, async (err, items) => {
        if (err) {
            return reject(err)
        }

        const dirs = items.filter(item => fs.statSync(path.join(config.paths.tx, item)).isDirectory())
        const listing = await Promise.all(dirs.map(dir => {
            return new Promise<{ modality: string, treatments: Header[] }>((resolve, reject) => {
                fs.readdir(path.join(config.paths.tx, dir), async (err: any, items: any) => {
                    if (err) return reject(err)
                    try {
                        const infos: Header[] = items.map(async (item: string) => await parseHeaderFromFile(path.join(config.paths.tx, dir, item)))
                        resolve({
                            modality: dir,
                            treatments: await Promise.all(infos)
                        })
                    } catch (err) {
                        reject(err)
                    }
                })
            })
        }))
        resolve(listing)
    })
})

router.get('/treatments', (_, res: express.Response) => {
    allInfo.then((i) => {
        res.send(i)
    })
})

router.use('/file', file({
    endpoint: 'tx',
    absoluteFilePath: config.relative.ibisRoot('system', 'tx')
}))

export default router
