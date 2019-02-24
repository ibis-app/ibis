//@ts-check
const { src, dest, watch, series } = require('gulp')
const clean = require('gulp-clean')
const glob = require('glob')

const distributable = "dist"
const source = "src"

/**
 * @param {string} prefix
 */
function staticAssets(prefix) {
    return ["**/*.hbs"].map(pattern => `${prefix}/${pattern}`)
}

function watchStaticAssets(_cb) {
    watch(staticAssets(source), series(cleanStaticAssets, copyStaticAssets))
}

function cleanStaticAssets() {
    return src(staticAssets(distributable), { read: false })
        .pipe(clean())
}

function copyStaticAssets() {
    return src(staticAssets(source))
        .pipe(dest(distributable))
}

exports.ls = function (cb) {
    staticAssets(source).forEach(pattern => {
        glob(pattern, function (err, files) {
            if (err) {
                return cb(err)
            }
            console.log(files)
        })
    })
    cb()
}

exports.copy = copyStaticAssets
exports.clean = cleanStaticAssets
exports.watch = watchStaticAssets
exports.default = watchStaticAssets