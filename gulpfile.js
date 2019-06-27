// @ts-check
const sourcemaps = require("gulp-sourcemaps")
const ts = require("gulp-typescript")
const del = require("del")
const gulp = require("gulp")
const debug = require("gulp-debug")
const rollup = require("gulp-better-rollup")
const newer = require("gulp-newer")
const changed = require("gulp-changed")
const { terser } = require("rollup-plugin-terser")
const json = require("rollup-plugin-json")
const resolve = require("rollup-plugin-node-resolve")
const babel = require("rollup-plugin-babel")

function compress(scripts, out) {
    const executor = () => gulp.src(scripts)
        .pipe(debug({ title: "compressing" }))
        .pipe(rollup({
            plugins: [
                json(),
                resolve({
                    preferBuiltins: true
                }),
                babel({
                    exclude: "node_modules/**",
                    presets: ["@babel/preset-env"],
                }),
                terser()
            ],
        }, {
                format: "cjs",
                exports: "named",
                browser: false
            }))
        .pipe(gulp.dest(out))
    executor.displayName = `compressing sources in ${scripts} to ${out}`
    return executor
}

/**
 * 
 * @param {import("gulp-typescript").Project} project 
 * @param {string} dist 
 */
function build(project, dist) {
    return () => project.src()
        .pipe(debug({ title: `compiling typescript source (${project.configFileName})` }))
        .pipe(newer({
            dest: project.projectDirectory,
            ext: ".js"
        }))
        .pipe(sourcemaps.init())
        .pipe(project())
        .pipe(sourcemaps.write('.', { sourceRoot: "./", includeContent: false }))
        .pipe(debug({ title: `compiled typescript source (${project.configFileName})` }))
        .pipe(gulp.dest(dist))
}

function project({
    paths: {
        tsconfig: tsconfig = "tsconfig.json",
        src: src = "src",
        dist: dist = "dist",
        out: out = "out",
        scripts: scripts = ["dist/**/*.js"],
        /**
         * Assumed to be copied from {@link src}.
         */
        static: static = null,
        /**
         * Copied as is to {@link dist} and {@link out}.
         */
        vendor: vendor = null
    }
}) {
    /**
     * @type {string[]}
     */
    const configs = Array.isArray(tsconfig) ? tsconfig : [tsconfig];
    const projects = configs.map(config => ts.createProject(config))
    const quickProjects = configs.map(config => ts.createProject(config, { isolatedModules: true }))

    function copy(title, a, base) {
        if (!a) {
            return function (destination) {
                return function noop(done) { done(); }
            }
        }
        return function (destination) {
            function copyTask(done) {
                if (a && a.length <= 0) {
                    done()
                } else {
                    return gulp.src(a, { base: base })
                        .pipe(changed(destination))
                        .pipe(debug({ title: `${title} -> ${destination}` }))
                        .pipe(gulp.dest(destination))
                }
            }

            copyTask.displayName = `copy sources from ${base} matching '${a}' to ${destination}`

            return copyTask
        }
    }

    const copyStatic = copy("copying static assets", static, src)
    const copyVendor = copy("copying vendor assets", vendor, ".")

    function localBuild(done) {
        const tasks = projects.map(project => build(project, dist))
        return gulp.parallel(...tasks)(done)
    }

    function localBuildFast(done) {
        const tasks = quickProjects.map(project => build(project, dist))
        return gulp.parallel(...tasks)(done)
    }

    function cleanFolder(folder) {
        const cleanTask = () => del(folder)
        cleanTask.displayName = "Removing all files in " + folder
        return cleanTask
    }

    const copyStaticSourcesToDestination = gulp.parallel(copyStatic(dist), copyVendor(dist))

    const copyStaticSourcesToCompressed = gulp.parallel(copyStatic(out), copyVendor(out))

    const clean = gulp.parallel(cleanFolder(dist), cleanFolder(out))

    const bundle = gulp.parallel(copyStaticSourcesToCompressed, compress(scripts, out))

    function package(done) {
        try {
            const args = ["./package.json", '--out-path', dist]
            const { exec } = require("pkg")

            return exec(args)
                .catch(done)
                .then(done)
        } catch (e) {
            done(e)
        }
    }

    /**
     * Watches all source files
     */
    function watch() {
        projects.forEach(project => {
            const typescriptSourceGlobs = project.config.include || `${project.projectDirectory}/${src}/**/*`

            console.debug('watching following globs for changes:', typescriptSourceGlobs)

            gulp.watch(typescriptSourceGlobs, localBuild)
        })
    }

    return {
        copy: copyStaticSourcesToDestination,
        build: gulp.parallel(copyStaticSourcesToDestination, localBuild),
        buildFast: gulp.parallel(copyStaticSourcesToDestination, localBuildFast),
        watch: watch,
        clean: clean,
        compress: compress(scripts, out),
        bundle: bundle,
        package: gulp.series(bundle, package)
    }
}

/**
 * @param {string} config Path to a tsconfig.json.
 * @param {any} [settings]
 * @returns A stream that can be `gulp.pipe`'d to a destination.
 */
function buildTypescriptSources(config, settings) {
    const project = ts.createProject(config, settings)

    return project.src()
        .pipe(debug({ title: `compiling typescript source (${config})` }))
        .pipe(newer({
            dest: project.projectDirectory,
            ext: ".js"
        }))
        .pipe(sourcemaps.init())
        .pipe(project())
        .pipe(sourcemaps.write('.', { sourceRoot: "./", includeContent: false }))
        .pipe(debug({ title: `compiled typescript source (${config})` }))
}

exports.project = project;

