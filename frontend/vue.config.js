module.exports = {
  transpileDependencies: ["vuetify"],
  publicPath: process.env.NODE_ENV === "production" ? "/static/dist/" : "",
  chainWebpack(config) {
    config.module
      .rule("js")
      .test(/\.js$/)
      .use("@open-wc/webpack-import-meta-loader")
      .loader("@open-wc/webpack-import-meta-loader");
  },
  configureWebpack: config => {
    config.optimization = {
      ...config.optimization,
      minimize: false
    };
  },
  lintOnSave: false
};
