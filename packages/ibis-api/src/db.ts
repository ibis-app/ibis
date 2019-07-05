import { Header, Modality } from "@ibis-app/lib"
import nano, { MangoQuery, DocumentInsertResponse, IdentifiedDocument, RevisionedDocument } from "nano"

import { randomBytes } from "crypto";
import { couchInstanceUrl } from "./config";

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
    category: Category,
    modality: Modality,
    header: Header
}

export interface ExistingDirectory extends Directory, IdentifiedDocument, RevisionedDocument {

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

var server = new Promise<nano.ServerScope>((resolve, reject) => {
    const id = randomBytes(10).toString("base64")

    const couchConnectionOptions: nano.Configuration = {
        url: couchInstanceUrl,
        requestDefaults: {
            timeout: 5000
        },
        // Add for verbose logging:
        // log: (requestBody, args) => console.debug(`[${id}][couchdb] ${JSON.stringify(requestBody)} ${args}`)
    }

    try {
        console.debug(`[${id}] connecting to couchdb`, couchConnectionOptions)
        const serverScope = nano(couchConnectionOptions)
        console.debug(`[${id}] successfully opened connection`, couchConnectionOptions)
        resolve(serverScope)
    } catch (e) {
        reject(e)
    }
})

const databases: { [key in Category]: Promise<void> } = {
    "monographs": initializeDatabase("monographs"),
    "treatments": initializeDatabase("treatments")
};

async function initializeDatabase(dbName: Category) {
    const s = await server

    try {
        await s.db.get(dbName)
    } catch {
        await s.db.create(dbName)
    }
}

async function initializeDatabases() {
    try {
        return await Promise.all([initializeDatabase("monographs"), initializeDatabase("treatments")])
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

async function getDatabase<TDirectory = ExistingDirectory>(category: Category) {
    switch (category) {
        case "monographs":
            await databases.monographs
            return (await server).db.use<TDirectory>("monographs");
        case "treatments":
            await databases.treatments
            return (await server).db.use<TDirectory>("treatments");
            default:
                throw new Error(`failed to get database for category '${category}'`)
    }
}

async function getEntry(directory: ExistingDirectory) {
    var db = await getDatabase(directory.category)

    return await db.attachment.get(directory._id, "content")
}

export async function getMetaContent(category: Category, query?: MangoQuery): Promise<ExistingDirectory[]> {
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

export async function getContent(category: Category, query: MangoQuery): Promise<any[]> {
    const docs = await getMetaContent(category, query)

    return await Promise.all(docs.map(doc => getEntry(doc)))
}

export async function createMetaContent(directory: Directory): Promise<DocumentInsertResponse> {
    const db = await getDatabase<Directory>(directory.category)

    return await db.insert(directory)
}

export async function updateMetaContent(directory: ExistingDirectory): Promise<DocumentInsertResponse> {
    const db = await getDatabase(directory.category)

    return await db.insert(directory)
}

export async function addContent(directory: ExistingDirectory, content: Buffer | string, contentType: string): Promise<DocumentInsertResponse> {
    const db = await getDatabase(directory.category)

    return await db.attachment.insert(directory._id, "content", content, contentType)
}

export async function createDirectoryAndContent(directory: Directory, content: Buffer | string, contentType: string) {
    const db = await getDatabase(directory.category)

    const response = await createMetaContent(directory)

    return await db.attachment.insert(response.id, "content", content, contentType, { rev: response.rev })
}

export async function initialize() {
    await initializeDatabases()
}
