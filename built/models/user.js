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
const bcrypt_1 = __importDefault(require("bcrypt"));
const sql_1 = require("../helpers/sql");
const expressError_1 = require("../expressError");
const config_js_1 = require("../config.js");
/** Related functions for users. */
class User {
    /** authenticate user with username, password.
     *
     * Returns { username, first_name, last_name, email, is_admin }
     *
     * Throws UnauthorizedError is user not found or wrong password.
     **/
    static authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // try to find the user first
            const result = yield db_1.default.query(`SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`, [username]);
            const user = result.rows[0];
            if (user) {
                // compare hashed password to a new hash from password
                const isValid = yield bcrypt_1.default.compare(password, user.password);
                if (isValid === true) {
                    delete user.password;
                    return user;
                }
            }
            throw new expressError_1.UnauthorizedError("Invalid username/password");
        });
    }
    /** Register user with data.
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws BadRequestError on duplicates.
     **/
    static register({ username, password, firstName, lastName, email, isAdmin }) {
        return __awaiter(this, void 0, void 0, function* () {
            const duplicateCheck = yield db_1.default.query(`SELECT username
           FROM users
           WHERE username = $1`, [username]);
            if (duplicateCheck.rows[0]) {
                throw new expressError_1.BadRequestError(`Duplicate username: ${username}`);
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, config_js_1.BCRYPT_WORK_FACTOR);
            const result = yield db_1.default.query(`INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`, [
                username,
                hashedPassword,
                firstName,
                lastName,
                email,
                isAdmin,
            ]);
            const user = result.rows[0];
            return user;
        });
    }
    /** Find all users.
     *
     * Returns [{ username, first_name, last_name, email, is_admin }, ...]
     **/
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`);
            return result.rows;
        });
    }
    /** Given a username, return data about user.
     *
     * Returns { username, first_name, last_name, is_admin, jobs }
     *   where jobs is { id, title, company_handle, company_name, state }
     *
     * Throws NotFoundError if user not found.
     **/
    static get(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRes = yield db_1.default.query(`SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`, [username]);
            const user = userRes.rows[0];
            if (!user)
                throw new expressError_1.NotFoundError(`No user: ${username}`);
            const userApplicationsRes = yield db_1.default.query(`SELECT a.job_id
           FROM applications AS a
           WHERE a.username = $1`, [username]);
            user.applications = userApplicationsRes.rows.map(a => a.job_id);
            return user;
        });
    }
    /** Update user data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include:
     *   { firstName, lastName, password, email, isAdmin }
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws NotFoundError if not found.
     *
     * WARNING: this function can set a new password or make a user an admin.
     * Callers of this function must be certain they have validated inputs to this
     * or a serious security risks are opened.
     */
    static update(username, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.password) {
                data.password = yield bcrypt_1.default.hash(data.password, config_js_1.BCRYPT_WORK_FACTOR);
            }
            const { setCols, values } = (0, sql_1.sqlForPartialUpdate)(data, {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
            });
            const usernameVarIdx = "$" + (values.length + 1);
            const querySql = `UPDATE users
                      SET ${setCols}
                      WHERE username = ${usernameVarIdx}
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
            const result = yield db_1.default.query(querySql, [...values, username]);
            const user = result.rows[0];
            if (!user)
                throw new expressError_1.NotFoundError(`No user: ${username}`);
            delete user.password;
            return user;
        });
    }
    /** Delete given user from database; returns undefined. */
    static remove(username) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield db_1.default.query(`DELETE
           FROM users
           WHERE username = $1
           RETURNING username`, [username]);
            const user = result.rows[0];
            if (!user)
                throw new expressError_1.NotFoundError(`No user: ${username}`);
        });
    }
    /** Apply for job: update db, returns undefined.
     *
     * - username: username applying for job
     * - jobId: job id
     **/
    static applyToJob(username, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            const preCheck = yield db_1.default.query(`SELECT id
           FROM jobs
           WHERE id = $1`, [jobId]);
            const job = preCheck.rows[0];
            if (!job)
                throw new expressError_1.NotFoundError(`No job: ${jobId}`);
            const preCheck2 = yield db_1.default.query(`SELECT username
           FROM users
           WHERE username = $1`, [username]);
            const user = preCheck2.rows[0];
            if (!user)
                throw new expressError_1.NotFoundError(`No username: ${username}`);
            yield db_1.default.query(`INSERT INTO applications (job_id, username)
           VALUES ($1, $2)`, [jobId, username]);
        });
    }
}
module.exports = User;
//# sourceMappingURL=user.js.map