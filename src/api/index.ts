import app from './app'
import { port, hostname, apiHostname } from './config'

app.listen(port, hostname, () => {
    console.log(`Listening on ${apiHostname}`)
})