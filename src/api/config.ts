import path from 'path'

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
    }
}

export default config