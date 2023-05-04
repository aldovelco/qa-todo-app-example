const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.env = config.env || {};
      config.baseUrl = config.env.baseUrl;

      return config;
    },
  },
});
