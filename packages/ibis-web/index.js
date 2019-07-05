//@ts-check
const express = require("express");

var app = express();

try {
    app
    .use(express.static("dist", {
        dotfiles: "ignore",
        extensions: ["html", "js"]
    }))
    .listen(8080, 'localhost', () => {
        console.log('listening on http://localhost:8080')
    })
} catch (e) {
    console.error(e)
    process.exit(1)
}
