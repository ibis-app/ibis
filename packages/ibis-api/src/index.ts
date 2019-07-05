import { apiHostname, hostname, port } from "./config"
import { app, initialize } from "./app"
import { h2 } from "@ibis-app/lib"

export { port, hostname, apiHostname, default as config } from "./config"
export { SearchResult, CategorizedSearchMap, CategorizedSearchResult } from "./search"

export const start = () => {
    h2(app)
        .then(async server => {
            await initialize()
            server.listen(port, hostname, () => {
                console.log(`Listening on ${apiHostname}`)
                process.send && process.send("initialized")
            })
        })
        .catch((e) => {
            console.error(e)
            process.exit(1)
        })
}
