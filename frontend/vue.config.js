module.exports = {
  transpileDependencies: ["vuetify"],
  publicPath: process.env.NODE_ENV === "production" ? "/static/dist/" : "",
  configureWebpack: {
  experiments: {
    syncWebAssembly: true,
    topLevelAwait: true
  },
    optimization: {
      minimize: false
    }
  },
  lintOnSave: false
};
