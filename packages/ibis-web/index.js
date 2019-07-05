//@ts-check
const { createServer } = require("http-server");

createServer({
    root: "dist",
    showDotfiles: false,
    gzip: true
}).listen(8080, 'localhost', () => {
    console.log('listening on http://localhost:8080')
});