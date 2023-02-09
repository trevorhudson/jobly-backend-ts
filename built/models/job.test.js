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
const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds, } = require("./_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** create */
describe("create", function () {
    let newJob = {
        companyHandle: "c1",
        title: "Test",
        salary: 100,
        equity: "0.1",
    };
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let job = yield Job.create(newJob);
            expect(job).toEqual(Object.assign(Object.assign({}, newJob), { id: expect.any(Number) }));
        });
    });
});
/************************************** findAll */
describe("findAll", function () {
    test("works: no filter", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let jobs = yield Job.findAll();
            expect(jobs).toEqual([
                {
                    id: testJobIds[0],
                    title: "Job1",
                    salary: 100,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: testJobIds[1],
                    title: "Job2",
                    salary: 200,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: testJobIds[2],
                    title: "Job3",
                    salary: 300,
                    equity: "0",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: testJobIds[3],
                    title: "Job4",
                    salary: null,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ]);
        });
    });
    test("works: by min salary", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let jobs = yield Job.findAll({ minSalary: 250 });
            expect(jobs).toEqual([
                {
                    id: testJobIds[2],
                    title: "Job3",
                    salary: 300,
                    equity: "0",
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ]);
        });
    });
    test("works: by equity", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let jobs = yield Job.findAll({ hasEquity: true });
            expect(jobs).toEqual([
                {
                    id: testJobIds[0],
                    title: "Job1",
                    salary: 100,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: testJobIds[1],
                    title: "Job2",
                    salary: 200,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ]);
        });
    });
    test("works: by min salary & equity", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let jobs = yield Job.findAll({ minSalary: 150, hasEquity: true });
            expect(jobs).toEqual([
                {
                    id: testJobIds[1],
                    title: "Job2",
                    salary: 200,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ]);
        });
    });
    test("works: by name", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let jobs = yield Job.findAll({ title: "ob1" });
            expect(jobs).toEqual([
                {
                    id: testJobIds[0],
                    title: "Job1",
                    salary: 100,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ]);
        });
    });
});
/************************************** get */
describe("get", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let job = yield Job.get(testJobIds[0]);
            expect(job).toEqual({
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            });
        });
    });
    test("not found if no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Job.get(0);
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
    let updateData = {
        title: "New",
        salary: 500,
        equity: "0.5",
    };
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let job = yield Job.update(testJobIds[0], updateData);
            expect(job).toEqual(Object.assign({ id: testJobIds[0], companyHandle: "c1" }, updateData));
        });
    });
    test("not found if no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Job.update(0, {
                    title: "test",
                });
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
    test("bad request with no data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Job.update(testJobIds[0], {});
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
            yield Job.remove(testJobIds[0]);
            const res = yield db.query("SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
            expect(res.rows.length).toEqual(0);
        });
    });
    test("not found if no such job", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Job.remove(0);
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
});
//# sourceMappingURL=job.test.js.map