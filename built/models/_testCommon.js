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
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_js_1 = __importDefault(require("../db.js"));
const config_1 = require("../config");
const testJobIds = [];
function commonBeforeAll() {
    return __awaiter(this, void 0, void 0, function* () {
        // noinspection SqlWithoutWhere
        yield db_js_1.default.query("DELETE FROM companies");
        // noinspection SqlWithoutWhere
        yield db_js_1.default.query("DELETE FROM users");
        yield db_js_1.default.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);
        const resultsJobs = yield db_js_1.default.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('Job1', 100, '0.1', 'c1'),
           ('Job2', 200, '0.2', 'c1'),
           ('Job3', 300, '0', 'c1'),
           ('Job4', NULL, NULL, 'c1')
    RETURNING id`);
        testJobIds.splice(0, 0, ...resultsJobs.rows.map(r => r.id));
        yield db_js_1.default.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`, [
            yield bcrypt_1.default.hash("password1", config_1.BCRYPT_WORK_FACTOR),
            yield bcrypt_1.default.hash("password2", config_1.BCRYPT_WORK_FACTOR),
        ]);
        yield db_js_1.default.query(`
        INSERT INTO applications(username, job_id)
        VALUES ('u1', $1)`, [testJobIds[0]]);
    });
}
function commonBeforeEach() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_js_1.default.query("BEGIN");
    });
}
function commonAfterEach() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_js_1.default.query("ROLLBACK");
    });
}
function commonAfterAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_js_1.default.end();
    });
}
module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
};
//# sourceMappingURL=_testCommon.js.map