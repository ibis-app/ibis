import _ from 'lodash'
import fs from 'fs'
import { parse, HTMLElement, TextNode, Node } from 'node-html-parser'
import { RequestHandler, Request, NextFunction } from 'express'

export const modalities: { [code: string]: { displayName: string } } = {
    'acup': {
        displayName: "Acupuncture"
    },
    'bota': {
        displayName: "Botanical Medicine"
    },
    'chin': {
        displayName: "Chinese Medicine"
    },
    'diag': {
        displayName: "Diagnostic"
    },
    'home': {
        displayName: "Homeopathy"
    },
    'inte': {
        displayName: "WHO TF KNOWS"
    },
    'nutr': {
        displayName: "Nutrition"
    },
    'phys': {
        displayName: "Physical Medicine"
    },
    'psyc': {
        displayName: "Psychology (?)"
    },
    'vibr': {
        displayName: "Vibrators? Who tf knows"
    },
}

export const getModality = (codeOrDisplayName: string) => {
    const lower = codeOrDisplayName.toLowerCase()

    if (lower in modalities) {
        return modalities[lower];
    }
}

const possibleNodes: (node: Node) => string[] = (node: Node) => {
    if (!node) {
        return []
    }

    return _.flatten(node.childNodes
        .map(node => {
            if (node instanceof TextNode) {
                return [node.rawText.trim()]
            } else if (node instanceof HTMLElement) {
                if (node.childNodes[0] instanceof TextNode) {
                    return node.childNodes.slice(0, 10).map(n => n.rawText.trim())
                }
            }
            return []
        }))
        .filter(nodeText => nodeText !== '')
}

export interface Header {
    version: string,
    tag: string,
    name: string,
    category: string

}

export function parseHeaderFromFile(filepath: string): Promise<Header> {
    if (typeof filepath === 'undefined') {
        return Promise.reject('undefined filepath')
    }
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, async (err, data) => {
            if (err) {
                reject(err)
            }

            let interestingNode;

            try {
                interestingNode = await parseHeader(data)
            } catch (e) {
                return reject(e)
            }

            const [
                version,
                _,
                tag,
                name,
                category
            ] = interestingNode;

            resolve({
                version: version,
                tag: tag,
                name: name,
                category: category
            })
        })
    })
}

const versionPattern = /^-IBIS-(\d+)\.(\d+)\.(\d+)-$/

// TODO: this doesn't reliably parse the headers for most files
// @bspriggs investigate
export async function parseHeader(source: Buffer): Promise<string[]> {
    const root = parse(source.toString(), { noFix: false, lowerCaseTagName: true })

    const htmlRoot = (root.childNodes
        .find(node => node instanceof HTMLElement) as HTMLElement)

    if (!htmlRoot) {
        return []
    }

    const interestingNodes: string[] = [].concat(
        possibleNodes(htmlRoot),
        possibleNodes(htmlRoot.querySelector("head")),
        possibleNodes(htmlRoot.querySelector("body")))

    const first = interestingNodes.findIndex(node => versionPattern.test(node))

    // console.log(first)
    // console.dir(interestingNodes)

    return interestingNodes.slice(first, first + 5)
}

export const requestLogger: RequestHandler = (req: Request, _, next: NextFunction) => {
    console.log(JSON.stringify(
        {
            date: new Date(),
            path: req.path,
            query: req.query,
            'user-agent': req.headers['user-agent'],
        }))
    next()
}