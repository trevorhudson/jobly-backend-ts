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
const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds, u1Token, u2Token, adminToken, } = require("./_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** POST /users */
describe("POST /users", function () {
    test("works for admins: create non-admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/users")
                .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: false,
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(201);
            expect(resp.body).toEqual({
                user: {
                    username: "u-new",
                    firstName: "First-new",
                    lastName: "Last-newL",
                    email: "new@email.com",
                    isAdmin: false,
                }, token: expect.any(String),
            });
        });
    });
    test("works for admins: create admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/users")
                .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: true,
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(201);
            expect(resp.body).toEqual({
                user: {
                    username: "u-new",
                    firstName: "First-new",
                    lastName: "Last-newL",
                    email: "new@email.com",
                    isAdmin: true,
                }, token: expect.any(String),
            });
        });
    });
    test("unauth for users", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/users")
                .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: true,
            })
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/users")
                .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: true,
            });
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("bad request if missing data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/users")
                .send({
                username: "u-new",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
    test("bad request if invalid data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post("/users")
                .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "not-an-email",
                isAdmin: true,
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
});
/************************************** GET /users */
describe("GET /users", function () {
    test("works for admins", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get("/users")
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({
                users: [
                    {
                        username: "u1",
                        firstName: "U1F",
                        lastName: "U1L",
                        email: "user1@user.com",
                        isAdmin: false,
                    },
                    {
                        username: "u2",
                        firstName: "U2F",
                        lastName: "U2L",
                        email: "user2@user.com",
                        isAdmin: false,
                    },
                    {
                        username: "u3",
                        firstName: "U3F",
                        lastName: "U3L",
                        email: "user3@user.com",
                        isAdmin: false,
                    },
                ],
            });
        });
    });
    test("unauth for non-admin users", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get("/users")
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get("/users");
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("fails: test next() handler", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // there's no normal failure event which will cause this route to fail ---
            // thus making it hard to test that the error-handler works with it. This
            // should cause an error, all right :)
            yield db.query("DROP TABLE users CASCADE");
            const resp = yield request(app)
                .get("/users")
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(500);
        });
    });
});
/************************************** GET /users/:username */
describe("GET /users/:username", function () {
    test("works for admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/users/u1`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({
                user: {
                    username: "u1",
                    firstName: "U1F",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                    applications: [testJobIds[0]],
                },
            });
        });
    });
    test("works for same user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/users/u1`)
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.body).toEqual({
                user: {
                    username: "u1",
                    firstName: "U1F",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                    applications: [testJobIds[0]],
                },
            });
        });
    });
    test("unauth for other users", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/users/u1`)
                .set("authorization", `Bearer ${u2Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/users/u1`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("not found if user not found", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .get(`/users/nope`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(404);
        });
    });
});
/************************************** PATCH /users/:username */
describe("PATCH /users/:username", () => {
    test("works for admins", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/users/u1`)
                .send({
                firstName: "New",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({
                user: {
                    username: "u1",
                    firstName: "New",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                },
            });
        });
    });
    test("works for same user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/users/u1`)
                .send({
                firstName: "New",
            })
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.body).toEqual({
                user: {
                    username: "u1",
                    firstName: "New",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                },
            });
        });
    });
    test("unauth if not same user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/users/u1`)
                .send({
                firstName: "New",
            })
                .set("authorization", `Bearer ${u2Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/users/u1`)
                .send({
                firstName: "New",
            });
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("not found if no such user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/users/nope`)
                .send({
                firstName: "Nope",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(404);
        });
    });
    test("bad request if invalid data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/users/u1`)
                .send({
                firstName: 42,
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(400);
        });
    });
    test("works: can set new password", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .patch(`/users/u1`)
                .send({
                password: "new-password",
            })
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({
                user: {
                    username: "u1",
                    firstName: "U1F",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                },
            });
            const isSuccessful = yield User.authenticate("u1", "new-password");
            expect(isSuccessful).toBeTruthy();
        });
    });
});
/************************************** DELETE /users/:username */
describe("DELETE /users/:username", function () {
    test("works for admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/users/u1`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({ deleted: "u1" });
        });
    });
    test("works for same user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/users/u1`)
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.body).toEqual({ deleted: "u1" });
        });
    });
    test("unauth if not same user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/users/u1`)
                .set("authorization", `Bearer ${u2Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/users/u1`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("not found if user missing", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .delete(`/users/nope`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(404);
        });
    });
});
/************************************** POST /users/:username/jobs/:id */
describe("POST /users/:username/jobs/:id", function () {
    test("works for admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/users/u1/jobs/${testJobIds[1]}`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.body).toEqual({ applied: testJobIds[1] });
        });
    });
    test("works for same user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/users/u1/jobs/${testJobIds[1]}`)
                .set("authorization", `Bearer ${u1Token}`);
            expect(resp.body).toEqual({ applied: testJobIds[1] });
        });
    });
    test("unauth for others", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/users/u1/jobs/${testJobIds[1]}`)
                .set("authorization", `Bearer ${u2Token}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("unauth for anon", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/users/u1/jobs/${testJobIds[1]}`);
            expect(resp.statusCode).toEqual(401);
        });
    });
    test("not found for no such username", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/users/nope/jobs/${testJobIds[1]}`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(404);
        });
    });
    test("not found for no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/users/u1/jobs/0`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(404);
        });
    });
    test("bad request invalid job id", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield request(app)
                .post(`/users/u1/jobs/0`)
                .set("authorization", `Bearer ${adminToken}`);
            expect(resp.statusCode).toEqual(404);
        });
    });
});
//# sourceMappingURL=users.test.js.map