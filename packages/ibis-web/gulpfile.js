// @ts-check
const package = require("./package.json")
const { parallel } = require("gulp")
const nodemon = require("nodemon")
const { project } = require("./../../gulpfile")

const { build, buildFast, clean, compress, bundle, watch } = project(package)

function watchStaticFiles() {
    nodemon(package.nodemon)
        .on('start', () => {
            console.log('started watching')
        })

    process.on('SIGABRT', () => nodemon.emit('exit'))
    process.on('SIGTERM', () => nodemon.emit('exit'))
}

exports.build = build;
exports.bundle = bundle;
exports.buildFast = buildFast;
exports.clean = clean;
exports.compress = compress;
exports.watch = parallel(watch, watchStaticFiles)
