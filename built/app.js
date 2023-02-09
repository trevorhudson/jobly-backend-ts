"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/** Express app for jobly. */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const expressError_1 = require("./expressError");
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const companies_1 = __importDefault(require("./routes/companies"));
const users_1 = __importDefault(require("./routes/users"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("tiny"));
app.use(auth_1.authenticateJWT);
app.use("/auth", auth_2.default);
app.use("/companies", companies_1.default);
app.use("/users", users_1.default);
app.use("/jobs", jobs_1.default);
/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    throw new expressError_1.NotFoundError();
});
/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test")
        console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
    return res.status(status).json({
        error: { message, status },
    });
});
module.exports = app;
//# sourceMappingURL=app.js.map