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
const { NotFoundError, BadRequestError, UnauthorizedError, } = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds, } = require("./_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** authenticate */
describe("authenticate", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.authenticate("u1", "password1");
            expect(user).toEqual({
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "u1@email.com",
                isAdmin: false,
            });
        });
    });
    test("unauth if no such user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.authenticate("nope", "password");
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof UnauthorizedError).toBeTruthy();
            }
        });
    });
    test("unauth if wrong password", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.authenticate("c1", "wrong");
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof UnauthorizedError).toBeTruthy();
            }
        });
    });
});
/************************************** register */
describe("register", function () {
    const newUser = {
        username: "new",
        firstName: "Test",
        lastName: "Tester",
        email: "test@test.com",
        isAdmin: false,
    };
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield User.register(Object.assign(Object.assign({}, newUser), { password: "password" }));
            expect(user).toEqual(newUser);
            const found = yield db.query("SELECT * FROM users WHERE username = 'new'");
            expect(found.rows.length).toEqual(1);
            expect(found.rows[0].is_admin).toEqual(false);
            expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
        });
    });
    test("works: adds admin", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield User.register(Object.assign(Object.assign({}, newUser), { password: "password", isAdmin: true }));
            expect(user).toEqual(Object.assign(Object.assign({}, newUser), { isAdmin: true }));
            const found = yield db.query("SELECT * FROM users WHERE username = 'new'");
            expect(found.rows.length).toEqual(1);
            expect(found.rows[0].is_admin).toEqual(true);
            expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
        });
    });
    test("bad request with dup data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.register(Object.assign(Object.assign({}, newUser), { password: "password" }));
                yield User.register(Object.assign(Object.assign({}, newUser), { password: "password" }));
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof BadRequestError).toBeTruthy();
            }
        });
    });
});
/************************************** findAll */
describe("findAll", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield User.findAll();
            expect(users).toEqual([
                {
                    username: "u1",
                    firstName: "U1F",
                    lastName: "U1L",
                    email: "u1@email.com",
                    isAdmin: false,
                },
                {
                    username: "u2",
                    firstName: "U2F",
                    lastName: "U2L",
                    email: "u2@email.com",
                    isAdmin: false,
                },
            ]);
        });
    });
});
/************************************** get */
describe("get", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield User.get("u1");
            expect(user).toEqual({
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "u1@email.com",
                isAdmin: false,
                applications: [testJobIds[0]],
            });
        });
    });
    test("not found if no such user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.get("nope");
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
});
/************************************** update */
describe("update", function () {
    const updateData = {
        firstName: "NewF",
        lastName: "NewF",
        email: "new@email.com",
        isAdmin: true,
    };
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let job = yield User.update("u1", updateData);
            expect(job).toEqual(Object.assign({ username: "u1" }, updateData));
        });
    });
    test("works: set password", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let job = yield User.update("u1", {
                password: "new",
            });
            expect(job).toEqual({
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "u1@email.com",
                isAdmin: false,
            });
            const found = yield db.query("SELECT * FROM users WHERE username = 'u1'");
            expect(found.rows.length).toEqual(1);
            expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
        });
    });
    test("not found if no such user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.update("nope", {
                    firstName: "test",
                });
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
    test("bad request if no data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            expect.assertions(1);
            try {
                yield User.update("c1", {});
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof BadRequestError).toBeTruthy();
            }
        });
    });
});
/************************************** remove */
describe("remove", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield User.remove("u1");
            const res = yield db.query("SELECT * FROM users WHERE username='u1'");
            expect(res.rows.length).toEqual(0);
        });
    });
    test("not found if no such user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.remove("nope");
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
});
/************************************** applyToJob */
describe("applyToJob", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield User.applyToJob("u1", testJobIds[1]);
            const res = yield db.query("SELECT * FROM applications WHERE job_id=$1", [testJobIds[1]]);
            expect(res.rows).toEqual([{
                    job_id: testJobIds[1],
                    username: "u1",
                }]);
        });
    });
    test("not found if no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.applyToJob("u1", 0, "applied");
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
    test("not found if no such user", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.applyToJob("nope", testJobIds[0], "applied");
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
});
//# sourceMappingURL=user.test.js.map