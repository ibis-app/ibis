// @ts-check
const package = require("./package.json")
const { parallel } = require("gulp")
const nodemon = require("nodemon")
const { project } = require("./../../gulpfile")

const { build, buildFast, clean, compress, bundle, watch } = project(package)

function watchStaticFiles(cb) {
    var monitor = nodemon(package.nodemon)
        .on('start', () => {
            console.log('started watching')
        })
        .on('error', () => process.exit(1))
        .on('exit', () => {
            cb();
            process.exit(0)
        })

    process.on('SIGABRT', () => monitor.emit('exit'))
    process.on('SIGTERM', () => monitor.emit('exit'))
    process.on('uncaughtException', () => monitor.emit('exit'))
}

exports.build = build;
exports.bundle = bundle;
exports.buildFast = buildFast;
exports.clean = clean;
exports.compress = compress;
exports.watch = parallel(watch, watchStaticFiles)
