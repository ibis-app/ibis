// @ts-check
const package = require("./package.json")
const { parallel } = require("gulp")
const nodemon = require("nodemon")
const { project } = require("./../../gulpfile")

const { build, buildFast, clean, compress, bundle, watch } = project(package)

function watchStaticFiles(cb) {
    var monitor = nodemon(package.nodemon)
        .on('restart', () => {
            console.debug('nodemon is restarting')
        })
        .on('start', () => {
            console.log('nodemon has started watching')
        })
        .on('error', (e) =>{
            console.error('nodemon has recieved unexpected error')
            console.error(e)
            process.exit(1)
        })
        .on('exit', (signal) => {
            switch (signal) {
                case "SIGUSR2":
                    monitor.emit('restart');
                    break;
                default:
                    console.log('exiting due to unexpected signal', signal)
                    cb();
                    process.exit(0)
            }
        })

    process.on('SIGUSR1', () => monitor.emit('restart'))
    process.on('SIGUSR2', () => monitor.emit('restart'))
    process.on('SIGABRT', () => monitor.emit('exit', 'abort'))
    process.on('SIGTERM', () => monitor.emit('exit', 'term'))
    process.on('uncaughtException', () => monitor.emit('exit', 'uncaught'))
}

exports.build = build;
exports.bundle = bundle;
exports.buildFast = buildFast;
exports.clean = clean;
exports.compress = compress;
exports.watch = parallel(watch, watchStaticFiles)
