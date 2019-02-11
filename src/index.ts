import app from './app'
import { port, hostname, appHostname } from './config'

app.listen(port, hostname, () => {
    console.log(`Listening on ${appHostname}`)
})