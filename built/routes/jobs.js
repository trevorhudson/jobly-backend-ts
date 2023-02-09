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
/** Routes for jobs. */
const jsonschema_1 = __importDefault(require("jsonschema"));
const express_1 = __importDefault(require("express"));
const expressError_1 = require("../expressError");
const auth_1 = require("../middleware/auth");
const job_1 = __importDefault(require("../models/job"));
const jobNew_json_1 = __importDefault(require("../schemas/jobNew.json"));
const jobUpdate_json_1 = __importDefault(require("../schemas/jobUpdate.json"));
const jobSearch_json_1 = __importDefault(require("../schemas/jobSearch.json"));
const router = express_1.default.Router({ mergeParams: true });
/** POST / { job } => { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.post("/", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const validator = jsonschema_1.default.validate(req.body, jobNew_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const job = yield job_1.default.create(req.body);
        return res.status(201).json({ job });
    });
});
/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */
router.get("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = req.query;
        // arrive as strings from querystring, but we want as int/bool
        if (q.minSalary !== undefined)
            q.minSalary = +q.minSalary;
        q.hasEquity = q.hasEquity === "true";
        const validator = jsonschema_1.default.validate(q, jobSearch_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const jobs = yield job_1.default.findAll(q);
        return res.json({ jobs });
    });
});
/** GET /[jobId] => { job }
 *
 * Returns { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */
router.get("/:id", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const job = yield job_1.default.get(req.params.id);
        return res.json({ job });
    });
});
/** PATCH /[jobId]  { fld1, fld2, ... } => { job }
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.patch("/:id", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const validator = jsonschema_1.default.validate(req.body, jobUpdate_json_1.default, { required: true });
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new expressError_1.BadRequestError(errs);
        }
        const job = yield job_1.default.update(req.params.id, req.body);
        return res.json({ job });
    });
});
/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */
router.delete("/:id", auth_1.ensureAdmin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield job_1.default.remove(req.params.id);
        return res.json({ deleted: +req.params.id });
    });
});
module.exports = router;
//# sourceMappingURL=jobs.js.map