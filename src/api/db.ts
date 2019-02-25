import '../promises'
import express from 'express'
import { Header, modalities, getModality, Modality } from '../common'
import config, { apiHostname } from './config'
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

export interface Directory {
    url: string,
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
            threshold: 0.25,
            location: 0,
            distance: 50,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            ...options
        })
        const results = search.search(query)

        if ('matches' in (results as any)) {
            return results as any
        } else {
            return results
        }
    }
}

const searchDirectory = searchOptions<Directory>({
    keys: ["header", "header.name"] as any
})

async function getAllTheMagic(resourcePrefix: string, abs: string): Promise<Directory[][]> {
    return await Promise.all(
        Object.keys(modalities).map(async modality => {
            console.debug("getting", abs, modality)
            const listing = await getListing(abs, modality)
            const fileInfos = await getFileInfo(abs, modality, listing)
            console.debug("done", abs, modality)

            return fileInfos.map(f => ({ ...f, url: `${resourcePrefix}/${modality}/${f.filename}`, modality: getModality(modality) }))
        }))
}


router.get('/', async (req, res) => {
    const db = await database();

    if (!req.query.q) {
        res.send(db.value())
        return
    }

    const t = db.get('treatments')
    const d = db.get('diseases')

    res.send(searchDirectory(req.query.q, [].concat(...t.value(), ...d.value())))
})

export interface SearchResult {
    directory: string,
    results: Directory[]
}

export interface CategorizedSearchResult {
    directory: string,
    results: Thing
}

export interface Thing {
    [name: string]: {
        name: string,
        results: Directory[]
    }
}

function formatSearchResponse(directory: string, results: Directory[], categorize: boolean = false): SearchResult | CategorizedSearchResult {
    if (categorize) {
        return ({
            directory: directory,
            results: (results as Directory[]).reduce((acc: Thing, cur) => {
                const name = cur.modality.data.displayName

                if (!(name in acc)) {
                    acc[name] = {
                        name: name,
                        results: [cur]
                    }
                } else {
                    acc[name].results.push(cur)
                }

                return acc
            }, {})
        })
    } else {
        return ({
            directory: directory,
            results: results
        })
    }
}

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
    } else {
        const values: Directory[] = db.get(sub).value()
        const results = searchDirectory(req.query.q, values)
        res.send(formatSearchResponse(sub, results as any, true))
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

    const txs = await getAllTheMagic(`${apiHostname}/tx`, config.relative.ibisRoot('system', 'tx'))
    const rxs = await getAllTheMagic(`${apiHostname}/rx`, config.relative.ibisRoot('system', 'rx'))
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