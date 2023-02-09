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
const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, } = require("./_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** POST /auth/token */
describe("POST /auth/token", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/token")
                .send({
                username: "u1",
                password: "password1",
            });
            expect(resp.body).toEqual({
                "token": expect.any(String),
            });
        });
    });
    test("unauth with non-existent user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/token")
                .send({
                username: "no-such-user",
                password: "password1",
            });
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth with wrong password", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/token")
                .send({
                username: "u1",
                password: "nope",
            });
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("bad request with missing data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/token")
                .send({
                username: "u1",
            });
            expect(resp.statusCode).toEqual(400);
        });
    });
    test("bad request with invalid data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/token")
                .send({
                username: 42,
                password: "above-is-a-number",
            });
            expect(resp.statusCode).toEqual(400);
        });
    });
});
/************************************** POST /auth/register */
describe("POST /auth/register", function () {
    test("works for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/register")
                .send({
                username: "new",
                firstName: "first",
                lastName: "last",
                password: "password",
                email: "new@email.com",
            });
            expect(resp.statusCode).toEqual(201);
            expect(resp.body).toEqual({
                "token": expect.any(String),
            });
        });
    });
    test("bad request with missing fields", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/register")
                .send({
                username: "new",
            });
            expect(resp.statusCode).toEqual(400);
        });
    });
    test("bad request with invalid data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/auth/register")
                .send({
                username: "new",
                firstName: "first",
                lastName: "last",
                password: "password",
                email: "not-an-email",
            });
            expect(resp.statusCode).toEqual(400);
        });
    });
});
//# sourceMappingURL=auth.test.js.map