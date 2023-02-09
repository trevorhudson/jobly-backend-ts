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
const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const testJobIds = [];
function commonBeforeAll() {
    return __awaiter(this, void 0, void 0, function* () {
        // noinspection SqlWithoutWhere
        yield db.query("DELETE FROM users");
        // noinspection SqlWithoutWhere
        yield db.query("DELETE FROM companies");
        yield Company.create({
            handle: "c1",
            name: "C1",
            numEmployees: 1,
            description: "Desc1",
            logoUrl: "http://c1.img",
        });
        yield Company.create({
            handle: "c2",
            name: "C2",
            numEmployees: 2,
            description: "Desc2",
            logoUrl: "http://c2.img",
        });
        yield Company.create({
            handle: "c3",
            name: "C3",
            numEmployees: 3,
            description: "Desc3",
            logoUrl: "http://c3.img",
        });
        testJobIds[0] = (yield Job.create({ title: "J1", salary: 1, equity: "0.1", companyHandle: "c1" })).id;
        testJobIds[1] = (yield Job.create({ title: "J2", salary: 2, equity: "0.2", companyHandle: "c1" })).id;
        testJobIds[2] = (yield Job.create({ title: "J3", salary: 3, /* equity null */ companyHandle: "c1" })).id;
        yield User.register({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "user1@user.com",
            password: "password1",
            isAdmin: false,
        });
        yield User.register({
            username: "u2",
            firstName: "U2F",
            lastName: "U2L",
            email: "user2@user.com",
            password: "password2",
            isAdmin: false,
        });
        yield User.register({
            username: "u3",
            firstName: "U3F",
            lastName: "U3L",
            email: "user3@user.com",
            password: "password3",
            isAdmin: false,
        });
        yield User.applyToJob("u1", testJobIds[0]);
    });
}
function commonBeforeEach() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.query("BEGIN");
    });
}
function commonAfterEach() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.query("ROLLBACK");
    });
}
function commonAfterAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.end();
    });
}
const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });
module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    u2Token,
    adminToken,
};
//# sourceMappingURL=_testCommon.js.map