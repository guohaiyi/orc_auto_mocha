const config = require("../../config");
const api = require("supertest")(config.api);
const omp_api = require("supertest")(config.omp_api);
module.exports = {
    api,
    omp_api
};

