//@ts-check
const { src, dest, watch, series } = require('gulp')
const clean = require('gulp-clean')
const glob = require('glob')

const dist = "dist"
const source = "src"

const staticAssets = function (prefix) {
    return ["**/*.hbs"].map(pattern => `${prefix}/${pattern}`)
} 

function watchStaticAssets(_cb) {
    watch(staticAssets(src), series(cleanStaticAssets, copyStaticAssets))
}

function cleanStaticAssets() {
    return src(staticAssets(dist), { read: false })
          .pipe(clean())
}

function copyStaticAssets() {
    return src(staticAssets(src))
           .pipe(dest(dist))
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