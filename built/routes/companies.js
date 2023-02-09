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
/** Routes for companies. */
const jsonschema_1 = __importDefault(require("jsonschema"));
const express_1 = __importDefault(require("express"));
const expressError_1 = require("../expressError");
const auth_1 = require("../middleware/auth");
const company_1 = __importDefault(require("../models/company"));
const companyNew_json_1 = __importDefault(require("../schemas/companyNew.json"));
const companyUpdate_json_1 = __importDefault(require("../schemas/companyUpdate.json"));
const companySearch_json_1 = __importDefault(require("../schemas/companySearch.json"));
const router = express_1.default.Router();
/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */
router.post("/", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const validator = jsonschema_1.default.validate(req.body, companyNew_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const company = yield company_1.default.create(req.body);
        return res.status(201).json({ company });
    });
});
/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = req.query;
        // arrive as strings from querystring, but we want as ints
        if (q.minEmployees !== undefined)
            q.minEmployees = +q.minEmployees;
        if (q.maxEmployees !== undefined)
            q.maxEmployees = +q.maxEmployees;
        const validator = jsonschema_1.default.validate(q, companySearch_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const companies = yield company_1.default.findAll(q);
        return res.json({ companies });
    });
});
/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */
router.get("/:handle", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield company_1.default.get(req.params.handle);
        return res.json({ company });
    });
});
/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: admin
 */
router.patch("/:handle", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const validator = jsonschema_1.default.validate(req.body, companyUpdate_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const company = yield company_1.default.update(req.params.handle, req.body);
        return res.json({ company });
    });
});
/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */
router.delete("/:handle", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield company_1.default.remove(req.params.handle);
        return res.json({ deleted: req.params.handle });
    });
});
module.exports = router;
//# sourceMappingURL=companies.js.map