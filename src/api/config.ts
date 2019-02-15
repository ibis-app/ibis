import path from 'path'

export const port: number = parseInt(process.env['API_PORT']) || 3000
export const hostname: string = process.env['API_HOSTNAME'] || 'localhost'
export const apiHostname: string = `http://${hostname}:${port}`

const applicationRoot: string = path.join(__dirname, '..', '..')
const ibisRoot: string = path.join(applicationRoot, 'IBIS-Mac OS X')
const system: string = path.join(ibisRoot, 'system')
const user: string = path.join(ibisRoot, 'system')

interface Config {
    paths: {
        applicationRoot: string,
        ibisRoot: string,
        system: string,
        user: string,
        rx: string,
        tx: string
    },
    relative: {
        ibisRoot: (...folders: string[]) => string
        applicationRoot: (...folders: string[]) => string
    }
}

var config: Config = {
    paths: {
        applicationRoot: applicationRoot,
        ibisRoot: ibisRoot,
        system: system,
        user: user,
        rx: path.join(system, 'rx'),
        tx: path.join(system, 'tx')
    },
    relative: {
        ibisRoot: (...folders: string[]) => path.join(ibisRoot, ...folders),
        applicationRoot: (...folders: string[]) => path.join(applicationRoot, ...folders)
    }
}

export default config