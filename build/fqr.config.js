const typescript = require('rollup-plugin-typescript2');
const resolve = require('rollup-plugin-node-resolve');
const { roll } = require("faqtor-of-rollup");
const { minify } = require("faqtor-of-uglify");
const { compress } = require("faqtor-of-gzip");
const { lock, publish } = require("faqtor-of-publish");
const { seq, cmd } = require("faqtor");

const
    input = "src/**/*",
    hyperoop = "hyperoop",
    hyperoopSrc = `src/${hyperoop}.ts`,
    hyperoopUmd = `dist/${hyperoop}.umd.js`,
    hyperoopMin = `dist/${hyperoop}.min.js`,
    hyperoopEs = `dist/${hyperoop}.es.js`;
    pubArgs = ["dist", "build/dist-lock.json"],
    tsconfigTest = "build/tsconfig.test.json",
    testDist = "test/dist",
    toClean = ["dist", "test/dist"],
    toWipe = toClean.concat(["./node_modules", "./coverage", "./.rpt2_cache"]);

const rollupPlugins = [
    typescript({
        typescript: require('typescript'),
        tsconfig: "./tsconfig.json",
        tsconfigOverride: { include: [input] },
    }),
    resolve(),
];

const rollupCfg = (format) => ({
    input: hyperoopSrc,
    output: {
        file: format === "es" ? hyperoopEs : hyperoopUmd,
        format,
        name: hyperoop,
        sourcemap: true,
    },
    plugins: rollupPlugins
})

const rollupEsCfg = rollupCfg("es");
const rollupUmdCfg = rollupCfg("umd");

const tsc = (project) => cmd(`tsc -p ${project}`);

const
    buildEs = roll(rollupEsCfg)
        .factor(input, hyperoopEs)
        .task("building ES module"),
    buildUmd = roll(rollupUmdCfg)
        .factor(input, hyperoopUmd)
        .task("building UMD module"),
    uglify = minify(hyperoopUmd, hyperoopMin)
        .factor()
        .task("uglifying UMD module"),
    gzip = compress(hyperoopMin, `${hyperoopMin}.gz`)
        .factor()
        .task("compressing minified module"),
    locker = lock(...pubArgs)
        .factor()
        .task("lock distribution files list"),
    buildTest = tsc(tsconfigTest)
        .factor(input, "test/dist/**/*")
        .task("building test files"),
    jest = cmd(`jest --coverage --env=jsdom`)
        .task("'jest' testing"),
    testTs = tsc("test/ts")
        .task("testing TypeScript types"),
    clean = cmd(`rimraf ${toClean.join(" ")}`),
    wipe = cmd(`rimraf ${toWipe.join(" ")}`);

module.exports = {
    build: seq(buildEs, buildUmd, uglify, gzip, locker),
    test: seq(buildTest, jest, testTs),
    publish: publish(...pubArgs),
    clean,
    wipe
}
