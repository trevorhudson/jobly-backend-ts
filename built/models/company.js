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
class Company {
    /** Create a company (from data), update db, return new company data.
     *
     * data should be { handle, name, description, numEmployees, logoUrl }
     *
     * Returns { handle, name, description, numEmployees, logoUrl }
     *
     * Throws BadRequestError if company already in database.
     * */
    static create({ handle, name, description, numEmployees, logoUrl }) {
        return __awaiter(this, void 0, void 0, function* () {
            const duplicateCheck = yield db_1.default.query(`SELECT handle
           FROM companies
           WHERE handle = $1`, [handle]);
            if (duplicateCheck.rows[0])
                throw new expressError_1.BadRequestError(`Duplicate company: ${handle}`);
            const result = yield db_1.default.query(`INSERT INTO companies
         (handle, name, description, num_employees, logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`, [
                handle,
                name,
                description,
                numEmployees,
                logoUrl,
            ]);
            const company = result.rows[0];
            return company;
        });
    }
    /** Create WHERE clause for filters, to be used by functions that query
     * with filters.
     *
     * searchFilters (all optional):
     * - minEmployees
     * - maxEmployees
     * - nameLike (will find case-insensitive, partial matches)
     *
     * Returns {
     *  where: "WHERE num_employees >= $1 AND name ILIKE $2",
     *  vals: [100, '%Apple%']
     * }
     */
    static _filterWhereBuilder({ minEmployees, maxEmployees, nameLike }) {
        let whereParts = [];
        let vals = [];
        if (minEmployees !== undefined) {
            vals.push(minEmployees);
            whereParts.push(`num_employees >= $${vals.length}`);
        }
        if (maxEmployees !== undefined) {
            vals.push(maxEmployees);
            whereParts.push(`num_employees <= $${vals.length}`);
        }
        if (nameLike) {
            vals.push(`%${nameLike}%`);
            whereParts.push(`name ILIKE $${vals.length}`);
        }
        const where = (whereParts.length > 0) ?
            "WHERE " + whereParts.join(" AND ")
            : "";
        return { where, vals };
    }
    /** Find all companies (optional filter on searchFilters).
     *
     * searchFilters (all optional):
     * - minEmployees
     * - maxEmployees
     * - nameLike (will find case-insensitive, partial matches)
     *
     * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
     * */
    static findAll(searchFilters = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { minEmployees, maxEmployees, nameLike } = searchFilters;
            if (minEmployees > maxEmployees) {
                throw new expressError_1.BadRequestError("Min employees cannot be greater than max");
            }
            const { where, vals } = this._filterWhereBuilder({
                minEmployees, maxEmployees, nameLike,
            });
            const companiesRes = yield db_1.default.query(`
      SELECT handle,
             name,
             description,
             num_employees AS "numEmployees",
             logo_url AS "logoUrl"
        FROM companies ${where}
        ORDER BY name
    `, vals);
            return companiesRes.rows;
        });
    }
    /** Given a company handle, return data about company.
     *
     * Returns { handle, name, description, numEmployees, logoUrl, jobs }
     *   where jobs is [{ id, title, salary, equity }, ...]
     *
     * Throws NotFoundError if not found.
     **/
    static get(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyRes = yield db_1.default.query(`SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [handle]);
            const company = companyRes.rows[0];
            if (!company)
                throw new expressError_1.NotFoundError(`No company: ${handle}`);
            const jobsRes = yield db_1.default.query(`SELECT id, title, salary, equity
           FROM jobs
           WHERE company_handle = $1
           ORDER BY id`, [handle]);
            company.jobs = jobsRes.rows;
            return company;
        });
    }
    /** Update company data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {name, description, numEmployees, logoUrl}
     *
     * Returns {handle, name, description, numEmployees, logoUrl}
     *
     * Throws NotFoundError if not found.
     */
    static update(handle, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { setCols, values } = (0, sql_1.sqlForPartialUpdate)(data, {
                numEmployees: "num_employees",
                logoUrl: "logo_url",
            });
            const handleVarIdx = "$" + (values.length + 1);
            const querySql = `UPDATE companies
                      SET ${setCols}
                        WHERE handle = ${handleVarIdx}
                        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
            const result = yield db_1.default.query(querySql, [...values, handle]);
            const company = result.rows[0];
            if (!company)
                throw new expressError_1.NotFoundError(`No company: ${handle}`);
            return company;
        });
    }
    /** Delete given company from database; returns undefined.
     *
     * Throws NotFoundError if company not found.
     **/
    static remove(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`, [handle]);
            const company = result.rows[0];
            if (!company)
                throw new expressError_1.NotFoundError(`No company: ${handle}`);
        });
    }
}
module.exports = Company;
//# sourceMappingURL=company.js.map