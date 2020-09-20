module.exports = {
  css: {
    extract: false,
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule.use('url-loader')
      .loader('url-loader')
      .tap(options => ({
        ...options,
        limit: 10240,
      }));

    config.module
      .rule('eslint')
      .use('eslint-loader')
      .options({
        fix: true,
      });
  },
};
