import { defineConfig } from 'cypress';
require('dotenv').config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here

      config.env.adminUsername = process.env.CYPRESS_ADMIN_USERNAME;
      config.env.adminPassword = process.env.CYPRESS_ADMIN_PASSWORD;
      config.env.username = process.env.CYPRESS_USERNAME;
      config.env.password = process.env.CYPRESS_PASSWORD;
      return config;
    },
  },
});
