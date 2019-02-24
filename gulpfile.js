//@ts-check
const { src, dest, watch, series } = require('gulp')
const clean = require('gulp-clean')
const glob = require('glob')

const dist = "dist"
const source = "src"
const staticAssets = ["**/*.hbs"]

function watchStaticAssets(_cb) {
    watch(staticAssets, series(cleanStaticAssets, copyStaticAssets))
}

function cleanStaticAssets() {
    return src(staticAssets.map(pattern => `${dist}/${pattern}`), { read: false })
          .pipe(clean())
}

function copyStaticAssets() {
    return src(staticAssets.map(pattern => `${source}/${pattern}`))
           .pipe(dest(dist))
}

exports.ls = function (cb) {
    staticAssets.forEach(pattern => {
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