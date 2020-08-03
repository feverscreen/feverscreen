module.exports = {
  presets: [
    [
      "@vue/babel-preset-app",
      {
        "targets": {
          "esmodules": true
        },
        "useBuiltIns": false,
        "shippedProposals": true,
        "debug": false,
      }
    ],
  ]
};
