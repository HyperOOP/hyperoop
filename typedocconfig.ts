module.exports = {
    src: [
      './src',
    ],
    mode: 'modules',
    includeDeclarations: true,
    tsconfig: 'tsconfig.json',
    out: './docs',
    excludePrivate: true,
    excludeProtected: true,
    excludeExternals: true,
    name: 'timscada-core',
    ignoreCompilerErrors: true,
    listInvalidSymbolLinks: true,
  };