module.exports = {
  transpileDependencies: ["vuetify"],
  publicPath: process.env.NODE_ENV === "production" ? "/static/dist/" : "",
  configureWebpack: {
  experiments: {
    syncWebAssembly: true
  },
    optimization: {
      minimize: false
    },
  },
  lintOnSave: false
};
