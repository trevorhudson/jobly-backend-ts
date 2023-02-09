"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCorrectUserOrAdmin = exports.ensureAdmin = exports.ensureLoggedIn = exports.authenticateJWT = void 0;
/** Convenience middleware to handle common auth cases in routes. */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const expressError_1 = require("../expressError");
/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jsonwebtoken_1.default.verify(token, config_1.SECRET_KEY);
        }
        return next();
    }
    catch (err) {
        return next();
    }
}
exports.authenticateJWT = authenticateJWT;
/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */
function ensureLoggedIn(req, res, next) {
    if (!res.locals.user)
        throw new expressError_1.UnauthorizedError();
    return next();
}
exports.ensureLoggedIn = ensureLoggedIn;
/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */
function ensureAdmin(req, res, next) {
    if (!res.locals.user || !res.locals.user.isAdmin) {
        throw new expressError_1.UnauthorizedError();
    }
    return next();
}
exports.ensureAdmin = ensureAdmin;
/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */
function ensureCorrectUserOrAdmin(req, res, next) {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.username === req.params.username))) {
        throw new expressError_1.UnauthorizedError();
    }
    return next();
}
exports.ensureCorrectUserOrAdmin = ensureCorrectUserOrAdmin;
//# sourceMappingURL=auth.js.map