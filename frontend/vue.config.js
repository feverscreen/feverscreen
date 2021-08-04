module.exports = {
  transpileDependencies: ["vuetify"],
  experiments: {
    syncWebAssembly: true
  },
  publicPath: process.env.NODE_ENV === "production" ? "/static/dist/" : "",
  configureWebpack: config => {
    config.optimization = {
      ...config.optimization,
      minimize: false
    };
  },
  lintOnSave: false
};
