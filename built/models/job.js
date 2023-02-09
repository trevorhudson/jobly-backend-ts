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
const db_1 = __importDefault(require("../db"));
const expressError_1 = require("../expressError");
const sql_1 = require("../helpers/sql");
class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle }
     **/
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`INSERT INTO jobs (title,
                             salary,
                             equity,
                             company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`, [
                data.title,
                data.salary,
                data.equity,
                data.companyHandle,
            ]);
            let job = result.rows[0];
            return job;
        });
    }
    /** Create WHERE clause for filters, to be used by functions that query
   * with filters.
   *
   * searchFilters (all optional):
   * - minSalary
   * - hasEquity
   * - title (will find case-insensitive, partial matches)
   *
   * Returns {
   *  where: "WHERE minSalary >= $1 AND title ILIKE $2",
   *  vals: [10000, '%Engineer%']
   * }
   */
    static _filterWhereBuilder({ minSalary, hasEquity, title }) {
        let whereParts = [];
        let vals = [];
        if (minSalary !== undefined) {
            vals.push(minSalary);
            whereParts.push(`salary >= $${vals.length}`);
        }
        if (hasEquity === true) {
            whereParts.push(`equity > 0`);
        }
        if (title !== undefined) {
            vals.push(`%${title}%`);
            whereParts.push(`title ILIKE $${vals.length}`);
        }
        const where = (whereParts.length > 0) ?
            "WHERE " + whereParts.join(" AND ")
            : "";
        return { where, vals };
    }
    /** Find all jobs (optional filter on searchFilters).
     *
     * searchFilters (all optional):
     * - minSalary
     * - hasEquity (true returns only jobs with equity > 0, other values ignored)
     * - title (will find case-insensitive, partial matches)
     *
     * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
     * */
    static findAll({ minSalary, hasEquity, title } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { where, vals } = this._filterWhereBuilder({
                minSalary, hasEquity, title,
            });
            const jobsRes = yield db_1.default.query(`SELECT j.id,
                j.title,
                j.salary,
                j.equity,
                j.company_handle AS "companyHandle",
                c.name AS "companyName"
          FROM jobs j
          LEFT JOIN companies AS c ON c.handle = j.company_handle
      ${where}`, vals);
            return jobsRes.rows;
        });
    }
    /** Given a job id, return data about job.
     *
     * Returns { id, title, salary, equity, companyHandle, company }
     *   where company is { handle, name, description, numEmployees, logoUrl }
     *
     * Throws NotFoundError if not found.
     **/
    static get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobRes = yield db_1.default.query(`SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`, [id]);
            const job = jobRes.rows[0];
            if (!job)
                throw new expressError_1.NotFoundError(`No job: ${id}`);
            const companiesRes = yield db_1.default.query(`SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [job.companyHandle]);
            delete job.companyHandle;
            job.company = companiesRes.rows[0];
            return job;
        });
    }
    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include: { title, salary, equity }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     */
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { setCols, values } = (0, sql_1.sqlForPartialUpdate)(data, {});
            const idVarIdx = "$" + (values.length + 1);
            const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${idVarIdx}
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;
            const result = yield db_1.default.query(querySql, [...values, id]);
            const job = result.rows[0];
            if (!job)
                throw new expressError_1.NotFoundError(`No job: ${id}`);
            return job;
        });
    }
    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if company not found.
     **/
    static remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`, [id]);
            const job = result.rows[0];
            if (!job)
                throw new expressError_1.NotFoundError(`No job: ${id}`);
        });
    }
}
module.exports = Job;
//# sourceMappingURL=job.js.map