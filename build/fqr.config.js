const typescript = require('rollup-plugin-typescript2');
const resolve = require('rollup-plugin-node-resolve');
const { roll } = require("faqtor-of-rollup");
const { minify } = require("faqtor-of-uglify");
const { compress } = require("faqtor-of-gzip");
const { lock, publish } = require("faqtor-of-publish");
const { seq, cmd } = require("faqtor");
1
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

const tsconfigBuild = {
    include: [
        "src/**/*"
    ],
};

const rollupPlugins = [
    typescript({
        typescript: require('typescript'),
        tsconfig: "./tsconfig.json",
        tsconfigOverride: tsconfigBuild,
    }),
    resolve(),
];

const rollupEsCfg = {
    input: hyperoopSrc,
    output: {
        file: hyperoopEs,
        format: "es",
        name: hyperoop,
        sourcemap: true,
    },
    plugins: rollupPlugins
}

const rollupUmdCfg = {
    input: hyperoopSrc,
    output: {
        file: hyperoopUmd,
        format: "umd",
        name: hyperoop,
        sourcemap: true,
    },
    plugins: rollupPlugins
}

const tsc = (project) => cmd(`tsc -p ${project}`)

const
    buildEs = roll(rollupEsCfg).factor(input, hyperoopEs),
    buildUmd = roll(rollupUmdCfg).factor(input, hyperoopUmd),
    uglify = minify(hyperoopUmd, hyperoopMin).factor(),
    gzip = compress(hyperoopMin, `${hyperoopMin}.gz`).factor(),
    locker = lock(...pubArgs).factor(),
    buildTest = tsc(tsconfigTest),
    jest = cmd(`jest --coverage --env=jsdom`),
    testTs = tsc("test/ts"),
    clean = cmd(`rimraf ${toClean.join(" ")}`),
    wipe = cmd(`rimraf ${toWipe.join(" ")}`);

module.exports = {
    build: seq(buildEs, buildUmd, uglify, gzip, locker),
    test: seq(buildTest, jest, testTs),
    publish: publish(...pubArgs),
    clean,
    wipe
}