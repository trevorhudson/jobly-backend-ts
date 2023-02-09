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
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds, u1Token, adminToken, } = require("./_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** POST /jobs */
describe("POST /jobs", function () {
    test("ok for admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/jobs`)
                .send({
                companyHandle: "c1",
                title: "J-new",
                salary: 10,
                equity: "0.2",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(201);
            expect(resp.body).toEqual({
                job: {
                    id: expect.any(Number),
                    title: "J-new",
                    salary: 10,
                    equity: "0.2",
                    companyHandle: "c1",
                },
            });
        });
    });
    test("unauth for users", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/jobs`)
                .send({
                companyHandle: "c1",
                title: "J-new",
                salary: 10,
                equity: "0.2",
            })
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("bad request with missing data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/jobs`)
                .send({
                companyHandle: "c1",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
    test("bad request with invalid data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/jobs`)
                .send({
                companyHandle: "c1",
                title: "J-new",
                salary: "not-a-number",
                equity: "0.2",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
});
/************************************** GET /jobs */
describe("GET /jobs", function () {
    test("ok for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app).get(`/jobs`);
            expect(resp.body).toEqual({
                jobs: [
                    {
                        id: expect.any(Number),
                        title: "J1",
                        salary: 1,
                        equity: "0.1",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        id: expect.any(Number),
                        title: "J2",
                        salary: 2,
                        equity: "0.2",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        id: expect.any(Number),
                        title: "J3",
                        salary: 3,
                        equity: null,
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                ],
            });
        });
    });
    test("works: filtering", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/jobs`)
                .query({ hasEquity: true });
            expect(resp.body).toEqual({
                jobs: [
                    {
                        id: expect.any(Number),
                        title: "J1",
                        salary: 1,
                        equity: "0.1",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        id: expect.any(Number),
                        title: "J2",
                        salary: 2,
                        equity: "0.2",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                ],
            });
        });
    });
    test("works: filtering on 2 filters", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/jobs`)
                .query({ minSalary: 2, title: "3" });
            expect(resp.body).toEqual({
                jobs: [
                    {
                        id: expect.any(Number),
                        title: "J3",
                        salary: 3,
                        equity: null,
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                ],
            });
        });
    });
    test("bad request on invalid filter key", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/jobs`)
                .query({ minSalary: 2, nope: "nope" });
            expect(resp.statusCode).toEqual(400);
        });
    });
});
/************************************** GET /jobs/:id */
describe("GET /jobs/:id", function () {
    test("works for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app).get(`/jobs/${testJobIds[0]}`);
            expect(resp.body).toEqual({
                job: {
                    id: testJobIds[0],
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    company: {
                        handle: "c1",
                        name: "C1",
                        description: "Desc1",
                        numEmployees: 1,
                        logoUrl: "http://c1.img",
                    },
                },
            });
        });
    });
    test("not found for no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app).get(`/jobs/0`);
            expect(resp.statusCode).toEqual(404);
        });
    });
});
/************************************** PATCH /jobs/:id */
describe("PATCH /jobs/:id", function () {
    test("works for admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/jobs/${testJobIds[0]}`)
                .send({
                title: "J-New",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({
                job: {
                    id: expect.any(Number),
                    title: "J-New",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                },
            });
        });
    });
    test("unauth for others", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/jobs/${testJobIds[0]}`)
                .send({
                title: "J-New",
            })
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("not found on no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/jobs/0`)
                .send({
                handle: "new",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
    test("bad request on handle change attempt", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/jobs/${testJobIds[0]}`)
                .send({
                handle: "new",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
    test("bad request with invalid data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/jobs/${testJobIds[0]}`)
                .send({
                salary: "not-a-number",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
});
/************************************** DELETE /jobs/:id */
describe("DELETE /jobs/:id", function () {
    test("works for admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/jobs/${testJobIds[0]}`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({ deleted: testJobIds[0] });
        });
    });
    test("unauth for others", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/jobs/${testJobIds[0]}`)
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/jobs/${testJobIds[0]}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("not found for no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/jobs/0`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(404);
        });
    });
});
//# sourceMappingURL=jobs.test.js.map