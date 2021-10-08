module.exports = {
  transpileDependencies: ["vuetify"],
  publicPath: process.env.NODE_ENV === "production" ? "/static/dist/" : "",
  devServer: {
    headers: { ["Cross-Origin-Embedder-Policy"]: "require-corp" }
  },
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
