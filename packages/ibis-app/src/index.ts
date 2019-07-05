import { appHostname, hostname, port } from "./config"

import { app } from "./app"
import { h2 } from "@ibis-app/lib"

export const start = () => h2(app)
        .then(server => {
                console.log(`Listening on ${appHostname}`)
                server.listen(port, hostname, () => {
                        process.send && process.send("initialized")
                })
        })
        .catch((e) => {
                console.error(e)
                process.exit(1)
        })
