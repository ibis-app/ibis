import '../promises'
import express from 'express'
import { Header, modalities, getModality, Modality } from '../common'
import config from './config'
import fuse from 'fuse.js'
import { getFileInfo, getListing } from './file';
import BetterFileAsync from './BetterFileAsync'
import lowdb from 'lowdb'


const adapter = new BetterFileAsync<Database>('db.json', {
    defaultValue: {
        diseases: [],
        treatments: [],
    }
})

const router = express.Router()

interface Directory {
    filename: string,
    modality: Modality,
    header: Header
}

export interface Database {
    diseases: Directory[]
    treatments: Directory[]
}

function searchOptions<DataType>(options?: fuse.FuseOptions<DataType>): (query: string, data: DataType[]) => DataType[] {
    return (query, data) => {
        const values = Array.from(data.values())
        console.log(query, values.length)
        const search = new fuse(values, {
            shouldSort: true,
            includeMatches: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            ...options
        })
        return search.search(query)
    }
}

const searchStrings = searchOptions({
    
})

const searchDirectory = searchOptions({
    keys: ["header", "header.name"] as any
})

const searchDiseases = (options: fuse.FuseOptions<Directory> = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
}) =>
    async (query: string) => {
        const db = await database()
        const data = db.get("treatments").value()
        const values = Array.from(data.values())
        console.log(query, values.length)
        const search = new fuse(values, options)
        return search.search(query)
    }

const s = searchDirectory

const getAllTheMagic = async (abs: string) => await Promise.all(
    Object.keys(modalities).map(async modality => {
        console.debug("getting", abs, modality)
        const listing = await getListing(abs, modality)
        const fileInfos = await getFileInfo(abs, modality, listing)
        console.debug("done", abs, modality)

        return fileInfos.map(f => ({ modality: getModality(modality), ...f }))
    }))


router.get('/', async (_, res) => {
    const db = await database()
    res.send(db.value())
})

router.get('/:sub', async (req, res) => {
    const {
        sub
    } = req.params

    const db = await database()

    if (!Object.keys(db.value()).includes(sub)) {
        res.sendStatus(404)
        return
    }

    if (!req.query.q) {
        res.send(db.get(sub).value())
        return
    } else {
        const values = db.get(sub).value()
        res.send(await s(req.query.q, values))
    }
})

function database(): Promise<lowdb.LowdbAsync<Database>> {
    return lowdb(adapter)
}

function allListings(d: Directory[][]): Directory[] {
    return [].concat(...d)
}

async function initialize() {
    const db = await database()

    console.log('initializing')

    if (db.get('treatments').value().length !== 0) {
        console.log('we done')
        return
    }

    const txs = await getAllTheMagic(config.relative.ibisRoot('system', 'tx'))
    const rxs = await getAllTheMagic(config.relative.ibisRoot('system', 'rx'))
    console.log('got all the magic')

    db.get('diseases').splice(0, 0, ...allListings(txs)).write()
    db.get('treatments').splice(0, 0, ...allListings(rxs)).write()
    console.log('finished mapping listings')
    // get ALL the files everywhere
    // put them in the diseases/ tx/ rx
}

(async () => {
    await initialize()
})().catch(console.error)

export default router