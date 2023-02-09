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
/** Routes for authentication. */
const jsonschema_1 = __importDefault(require("jsonschema"));
const user_1 = __importDefault(require("../models/user"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const tokens_1 = require("../helpers/tokens");
const userAuth_json_1 = __importDefault(require("../schemas/userAuth.json"));
const userRegister_json_1 = __importDefault(require("../schemas/userRegister.json"));
const expressError_1 = require("../expressError");
/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/token", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const validator = jsonschema_1.default.validate(req.body, userAuth_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const { username, password } = req.body;
        const user = yield user_1.default.authenticate(username, password);
        const token = (0, tokens_1.createToken)(user);
        return res.json({ token });
    });
});
/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/register", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const validator = jsonschema_1.default.validate(req.body, userRegister_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const newUser = yield user_1.default.register(Object.assign(Object.assign({}, req.body), { isAdmin: false }));
        const token = (0, tokens_1.createToken)(newUser);
        return res.status(201).json({ token });
    });
});
module.exports = router;
//# sourceMappingURL=auth.js.map