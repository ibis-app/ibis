//@ts-check
const { createServer } = require("http-server");

try {
    createServer({
        root: "dist",
        showDotfiles: false,
        gzip: true
    }).listen(8080, 'localhost', () => {
        console.log('listening on http://localhost:8080')
    })
} catch (e) {
    console.error(e)
    process.exit(1)
}
