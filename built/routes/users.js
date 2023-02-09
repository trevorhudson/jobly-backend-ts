"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/** Routes for users. */
const jsonschema_1 = __importDefault(require("jsonschema"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const expressError_1 = require("../expressError");
const user_1 = __importDefault(require("../models/user"));
const tokens_1 = require("../helpers/tokens");
const userNew_json_1 = __importDefault(require("../schemas/userNew.json"));
const userUpdate_json_1 = __importDefault(require("../schemas/userUpdate.json"));
const router = express_1.default.Router();
/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/
router.post("/", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validator = jsonschema_1.default.validate(req.body, userNew_json_1.default, { required: true });
            if (!validator.valid) {
                const errs = validator.errors.map(e => e.stack);
                throw new expressError_1.BadRequestError(...errs);
            }
            const user = yield user_1.default.register(req.body);
            const token = (0, tokens_1.createToken)(user);
            return res.status(201).json({ user, token });
        }
        catch (err) {
            return next(err);
        }
    });
});
/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/
router.get("/", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield user_1.default.findAll();
            return res.json({ users });
        }
        catch (err) {
            return next(err);
        }
    });
});
/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:username
 **/
router.get("/:username", auth_1.ensureCorrectUserOrAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_1.default.get(req.params.username);
            return res.json({ user });
        }
        catch (err) {
            return next(err);
        }
    });
});
/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.patch("/:username", auth_1.ensureCorrectUserOrAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validator = jsonschema_1.default.validate(req.body, userUpdate_json_1.default, { required: true });
            if (!validator.valid) {
                const errs = validator.errors.map(e => e.stack);
                throw new expressError_1.BadRequestError(...errs);
            }
            const user = yield user_1.default.update(req.params.username, req.body);
            return res.json({ user });
        }
        catch (err) {
            return next(err);
        }
    });
});
/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.delete("/:username", auth_1.ensureCorrectUserOrAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield user_1.default.remove(req.params.username);
            return res.json({ deleted: req.params.username });
        }
        catch (err) {
            return next(err);
        }
    });
});
/** POST /[username]/jobs/[id]  { state } => { application }
 *
 * Returns {"applied": jobId}
 *
 * Authorization required: admin or same-user-as-:username
 * */
router.post("/:username/jobs/:id", auth_1.ensureCorrectUserOrAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = +req.params.id;
            yield user_1.default.applyToJob(req.params.username, jobId);
            return res.json({ applied: jobId });
        }
        catch (err) {
            return next(err);
        }
    });
});
module.exports = router;
//# sourceMappingURL=users.js.map