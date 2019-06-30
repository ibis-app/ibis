import { Header, Modality } from "@ibis-app/lib"
import nano, { MangoQuery } from "nano"

import { randomBytes } from "crypto";
import { Request } from "request"
import { couchInstanceUrl } from "./config";
import { importEntriesFromDisk } from "./legacy-import"

export type Category = "monographs" | "treatments"

export function getCategoryFromRequestString(category: string): Category {
    switch (category) {
        case "treatments":
        case "diseases":
        case "therapeutics":
            return "treatments";
        case "monographs":
            return "monographs"
        default:
            throw new Error(`unknown category '${category}'`)
    }
}

export interface Directory {
    id: string,
    category: Category,
    modality: Modality,
    header: Header
}

export interface Entry extends Directory {
    content: string
}

export interface Database {
    /**
     * The description of a specific herb or strategy.
     */
    monographs: Directory[]
    /**
     * The treatments for specific diseases, using components from a modality.
     */
    treatments: Directory[]
}

export function getDirectoryIdentifier(directory: { category: Category, modality: Modality, id: string }): string {
    return `/${directory.category}/${directory.modality.code}/${directory.id}`
}

var server = new Promise<nano.ServerScope>((resolve) => {
    const id = randomBytes(10).toString("base64")

    const couchConnectionOptions: nano.Configuration = {
        url: couchInstanceUrl,
        requestDefaults: {
            timeout: 5000
        },
        log: (requestBody, args) => console.debug(`[${id}][couchdb] ${JSON.stringify(requestBody)} ${args}`)
    }

    console.debug(`[${id}] connecting to couchdb`, couchConnectionOptions)
    const serverScope = nano(couchConnectionOptions)
    console.debug(`[${id}] successfully opened connection`, couchConnectionOptions)
    resolve(serverScope)
})

async function initializeDatabase(dbName: string) {
    const s = await server
    try {
        await s.db.get(dbName)
        return true
    } catch {
        await s.db.create(dbName)
        return true
    }
}

async function initializeDatabases() {
    return await Promise.all([initializeDatabase("monographs"), initializeDatabase("treatments")])
}

async function getDatabase(category: Category) {
    await initializeDatabases()

    switch (category) {
        case "monographs":
            return (await server).db.use<Directory>("monographs");
        case "treatments":
            return (await server).db.use<Directory>("treatments");
            default:
                throw new Error(`failed to get database for category '${category}'`)
    }
}

async function getEntry(directory: Directory) {
    var db = await getDatabase(directory.category)

    return await db.attachment.getAsStream(getDirectoryIdentifier(directory), "entry")
}

export async function getMetaContent(category: Category, query?: MangoQuery): Promise<Directory[]> {
    const treatments = await getDatabase(category)

    if (!query) {
        // TODO: listAsStream?
        // https://www.npmjs.com/package/nano#nanodblistasstream
        var allDocumentResponse = await treatments.list({ include_docs: true })
        return allDocumentResponse.rows.map(r => r.doc)
    } else {
        var response = await treatments.find(query)
        return response.docs
    }
}

export async function getContent(category: Category, query: MangoQuery): Promise<Request[]> {
    const docs = await getMetaContent(category, query)

    return await Promise.all(docs.map(doc => getEntry(doc)))
}

async function isCouchDbInstanceInitialized(): Promise<boolean> {
    return false;
}

export async function initialize() {
    if (await isCouchDbInstanceInitialized()) {
        console.debug("initialized (cached)")
        return
    }

    try {
        console.debug(`fetching all listings from legacy IBIS directory`)

        const monographs = (await server).use("monographs")
        const treatments = (await server).use("treatments")

        const imported = await importEntriesFromDisk()

        await Promise.all([monographs.bulk({
            docs: imported.monographs
        }),
        treatments.bulk({
            docs: imported.treatments
        })]);

        console.debug("initialized")
    } catch (e) {
        console.error(`unable to initialize: ${e}`)
    }
}
