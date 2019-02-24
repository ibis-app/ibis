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
        diseaseNames: [],
        treatmentNames: []
    }
})

const router = express.Router()

interface Directory {
    filename: string,
    modality: Modality,
    header: Header
}

export interface Database {
    diseaseNames: string[],
    treatmentNames: string[],
    diseases: Directory[]
    treatments: Directory[]
}

const searchDiseases = (options: fuse.FuseOptions<Directory> = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    // ah, string indexing...
    keys: ["header", "header.name"] as any
}) =>
    async (query: string) => {
        const db = await database()
        const data = db.get('tx').value()
        const values = Array.from(data.values())
        console.log(query, values.length)
        const search = new fuse(values, options)
        return search.search(query)
    }

const s = searchDiseases()

const getAllTheMagic = async (abs: string) => await Promise.all(
    Object.keys(modalities).map(async modality => {
        console.debug("getting", abs, modality)
        const listing = await getListing(abs, modality)
        const fileInfos = await getFileInfo(abs, modality, listing)
        console.debug("done", abs, modality)

        return fileInfos.map(f => ({ modality: getModality(modality), ...f }))
    }))


router.get('/', async (req, res) => {
    if (req.query.q) {
        res.send(await s(req.query.q))
    } else {
        const db = await database()
        res.send(db.value())
    }
})

const database: () => Promise<lowdb.LowdbAsync<Database>> = () => lowdb(adapter)

const initialize = async () => {
    const db = await database()

    console.log('initializing')

    if (db.get('tx').value().length !== 0) {
        console.log('we done')
        return
    }

    const txs = await getAllTheMagic(config.relative.ibisRoot('system', 'tx'))
    const rxs = await getAllTheMagic(config.relative.ibisRoot('system', 'rx'))
    console.log('got all the magic')

    const allListings: (d: Directory[][]) => Directory[] = (d) => [].concat(...d)
    const getName: (d: Directory[][]) => string[] = (d) => [].concat(...d.map(modality => modality.map(listing => listing.header.name)))

    db.get('tx').splice(0, 0, ...allListings(txs)).write()
    db.get('rx').splice(0, 0, ...allListings(rxs)).write()
    db.get('diseaseNames').splice(0, 0, ...getName(txs)).write()
    db.get('treatmentNames').splice(0, 0, ...getName(rxs)).write()
    console.log('finished mapping listings')
    // get ALL the files everywhere
    // put them in the diseases/ tx/ rx
}

(async () => {
    await initialize()
})().catch(console.error)

export default router