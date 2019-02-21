import '../promises'
import express from 'express'
import { Header, modalities } from '../common'
import config from './config'
import fuse from 'fuse.js'
import { getFileInfo, getListing } from './file';
import nano from 'nano'

const server = nano('http://localhost:5984')

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
    (query: string) =>
        new Promise(async (resolve, reject) => {
            try {
                const data = await server.use('tx').find({
                    selector: {
                        _id: query
                    }
                })
                const search = new fuse(data.docs, options)
                resolve(search.search(query))
            } catch (e) {
                reject(e)
            }
        })

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
    res.send(await searchDiseases()(req.query.q))
})

const initialize = async () => {
    await server.db.create('tx')
    await server.db.create('rx')

    const tx_db: nano.DocumentScope<Directory> = server.db.use('tx')
    console.log('initializing')
    const tx = await getAllTheMagic(config.relative.ibisRoot('system', 'tx'))
    // const rx = await getAllTheMagic(config.relative.ibisRoot('system', 'rx'))
    console.log('got all the magic')

    const promises = tx.map(modality => {
        console.log('mapping modality', modality)
        return Promise.all(modality.map(async listing => {
            console.log('mapping listing', listing)
            await tx_db.insert(({ _id: listing.filename, _rev: listing.filename, ...listing }), listing.filename)
        }))
    })

    await Promise.all(promises)

    console.log('finished mapping listings')
    // get ALL the files everywhere
    // put them in the diseases/ tx/ rx
}

(async () => {
    await initialize()
})().catch(console.error)

export default router