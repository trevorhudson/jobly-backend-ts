"use strict";
/** Database setup for jobly. */
const pg_1 = require("pg");
const config_1 = require("./config");
const db = new pg_1.Client({
    connectionString: (0, config_1.getDatabaseUri)(),
});
db.connect();
module.exports = db;
//# sourceMappingURL=db.js.map