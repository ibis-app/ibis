import {
    Category,
    Directory,
    getCategoryFromRequestString,
    getDirectoryIdentifier,
    getMetaContent
} from "./db";
import { Router, default as express } from "express";

import fuse from "fuse.js";
import { getModality } from "@ibis-app/lib";

import flatten = require("lodash/flatten");

const router: Router = express.Router()

/**
 * Default options used when searching using Fuse.
 */
const defaultFuseOptions = {
    shouldSort: true,
    threshold: 0.25,
    location: 0,
    distance: 50,
    maxPatternLength: 32,
    minMatchCharLength: 1,
}

const modalityPattern = /m(?:odality)?:(\w+|".*?"|".*?")/g

router.get("/", async (req, res) => {
    if (!req.query.q) {
        res.sendStatus(204)
    } else {
        const entries = await Promise.all([
            getMetaContent("monographs"),
            getMetaContent("treatments")
        ])

        const results = searchDirectory(req.query.q, flatten(entries))

        res.send(results)
    }
})

export interface SearchDirectory extends Directory {
    /**
     * The URL that identifies this {@link Directory} on the API.
     */
    url: string
}

export function formatSearchDirectory(directory: Directory): SearchDirectory {
    return {
        ...directory,
        url: getDirectoryIdentifier(directory)
    }
}

export interface SearchResult {
    query: string,
    directory: string,
    results: SearchDirectory[]
}

export interface CategorizedSearchResult {
    query: string,
    directory: string,
    results: CategorizedSearchMap
}

export interface CategorizedSearchMap {
    [name: string]: {
        name: string,
        results: SearchDirectory[]
    }
}

function reduceSearchResults(acc: CategorizedSearchMap, cur: SearchDirectory): CategorizedSearchMap {
    const name = cur.modality.data.displayName

    if (name in acc) {
        acc[name].results.push(cur)
    } else {
        acc[name] = {
            name: name,
            results: [cur]
        }
    }

    return acc
}

function formatSearchResponse(query: string, directory: string, results: Directory[], categorize: boolean = false): SearchResult | CategorizedSearchResult {
    const formattedResults = results.map(formatSearchDirectory)

    if (categorize) {
        return {
            query,
            directory,
            results: formattedResults.reduce<CategorizedSearchMap>(reduceSearchResults, {})
        }
    } else {
        return {
            query,
            directory,
            results: formattedResults
        }
    }
}

router.get("/:sub", async (req, res) => {
    const {
        sub
    } = req.params

    let category: Category;

    try {
        category = getCategoryFromRequestString(sub)
    } catch (e) {
        res.sendStatus(404)
        return
    }

    const entries = await getMetaContent(category)

    const {
        q,
        categorize
    } = req.query

    const _categorize = typeof categorize === "undefined" ? false : categorize === "true";

    if (!q) {
        res.send(formatSearchResponse(q, sub, entries, _categorize));
    } else {
        const results = searchDirectory(req.query.q, entries)
        res.send(formatSearchResponse(q, sub, results, _categorize))
    }
})

function searchOptions<DataType>(options?: SearchOptions<DataType>): (q: string, data: DataType[]) => DataType[] {
    return (q, data) => {
        if (!data) {
            return []
        }

        if (options && options.f) {
            var formattedQuery = query(q)
            var parsedModality = getModality(formattedQuery.modality);

            if (parsedModality) {
                data = data.filter(options.f({
                    text: formattedQuery.text,
                    modality: parsedModality.code
                }))
                q = formattedQuery.text
            }
        }

        const search = new fuse(data, { ...defaultFuseOptions, ...options})

        console.log("searching", data.length, "entries on", `'${q}'`)

        return search.search(q)
    }
}

export function query(text: string): Query {
    const result: Query = {
        text: text
    }

    const matches = text.match(modalityPattern)

    if (matches !== null) {
        if (matches.length > 1) {
            throw new Error("multiple modality codes not allowed")
        }

        const match = modalityPattern.exec(text)
        const matchedModality = match[1]

        result.modality = matchedModality.replace(/[""]/g, "")
        result.text = result.text.replace(modalityPattern, "").trim()
    }

    return result
}

/**
 * Returns a filter that filters out {@link Directory} based on the {@link query}.
 * @param query A query
 */
export const directoryFilter = (query: Query) => (dir: Directory) => query.modality ? dir.modality.code === query.modality : true;

const searchDirectory = searchOptions<Directory>({
    keys: ["header", "header.name"] as any,
    f: directoryFilter
})

interface SearchOptions<T> extends fuse.FuseOptions<T> {
    f?: (query: Query) => (t: T) => boolean;
}

export interface Query {
    text: string,
    modality?: string
}

export {
    router
}
