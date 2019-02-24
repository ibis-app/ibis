import '../promises'
import express from 'express'
import { Header, modalities } from '../common'
import config from './config'
import fuse from 'fuse.js'
import { getFileInfo, getListing } from './file';
import { BetterFileAsync } from './BetterFileAsync'
import lowdb from 'lowdb'

const adapter = new BetterFileAsync<Database>('db.json', {
    defaultValue: {
        tx: [],
        rx: [],
        diseases: [],
        treatments: []
    }
})

const router = express.Router()

interface Directory {
    filename: string,
    header: Header
}

export interface Database {
    diseases: string[],
    treatments: string[],
    tx: Directory[]
    rx: Directory[]
}

const searchDiseases = (options: fuse.FuseOptions<Directory> = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["filename"]
}) =>
    async (query: string) => {
        const db = await database()
        const data = db.get('tx').value()
        console.log(query, data.length)
        const search = new fuse(Array.from(data.values()), options)
        return search.search(query)
    }

const s = searchDiseases()

const getAllTheMagic = async (abs: string) => {
    return await Promise.all(Object.keys(modalities).map(async modality => {
        console.debug("getting", abs, modality)
        const listing = await getListing(abs, modality)
        const fileInfos = await getFileInfo(abs, modality, listing)
        console.debug("done", abs, modality)

        return fileInfos
    }))
}

router.get('/', async (req, res) => {
    res.send(await s(req.query.q))
})

const database: () => Promise<lowdb.LowdbAsync<Database>> = () => lowdb(adapter)

const initialize = async () => {
    const db = await database()

    console.log('initializing')

    if (db.get('tx').value().length !== 0) {
        console.log('we done')
        return
    }

    const tx = await getAllTheMagic(config.relative.ibisRoot('system', 'tx'))
    // const rx = await getAllTheMagic(config.relative.ibisRoot('system', 'rx'))
    console.log('got all the magic')

    const allListings = [].concat(tx)
    db.get('tx').splice(0, 0, ...allListings).write()
    console.log('finished mapping listings')
    console.log(db.get('tx').value().length)
    // get ALL the files everywhere
    // put them in the diseases/ tx/ rx
}

(async () => {
    await initialize()
})().catch(console.error)

export default router