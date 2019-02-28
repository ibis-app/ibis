import app, { initialize } from './app'
import { port, hostname, apiHostname } from './config'

app.listen(port, hostname, async () => {
    await initialize()
    console.log(`Listening on ${apiHostname}`)
})