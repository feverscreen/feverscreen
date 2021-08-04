module.exports = {
  presets: [
    [
      "@vue/cli-plugin-babel/preset",
      {
        targets: {
          esmodules: true
        },
        useBuiltIns: false,
        shippedProposals: true,
        debug: false
      }
    ]
  ]
};
