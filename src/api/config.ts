import path from 'path'

const root: string = path.join(__dirname, '..', 'IBIS-Mac OS X')
const system: string = path.join(root, 'system')
const user: string = path.join(root, 'system')

interface Config {
    paths: {
        root: string,
        system: string,
        user: string,
        rx: string,
        tx: string
    }
}

var config: Config = {
    paths: {
        root: root,
        system: system,
        user: user,
        rx: path.join(system, 'rx'),
        tx: path.join(system, 'tx')
    }
}

export default config