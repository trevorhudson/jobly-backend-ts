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
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds, } = require("./_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** create */
describe("create", function () {
    const newCompany = {
        handle: "new",
        name: "New",
        description: "New Description",
        numEmployees: 1,
        logoUrl: "http://new.img",
    };
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let company = yield Company.create(newCompany);
            expect(company).toEqual(newCompany);
            const result = yield db.query(`SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`);
            expect(result.rows).toEqual([
                {
                    handle: "new",
                    name: "New",
                    description: "New Description",
                    num_employees: 1,
                    logo_url: "http://new.img",
                },
            ]);
        });
    });
    test("bad request with dupe", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Company.create(newCompany);
                yield Company.create(newCompany);
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof BadRequestError).toBeTruthy();
            }
        });
    });
});
/************************************** _filterWhereBuilder */
describe("_filterWhereBuilder", function () {
    test("works with no filter criteria", function () {
        const criteria = {};
        expect(Company._filterWhereBuilder(criteria)).toEqual({
            where: "",
            vals: [],
        });
    });
    test("works with min and not max", function () {
        const criteria = {
            minEmployees: 10,
        };
        expect(Company._filterWhereBuilder(criteria)).toEqual({
            where: "WHERE num_employees >= $1",
            vals: [10],
        });
    });
    test("works with max and not min", function () {
        const criteria = {
            maxEmployees: 10,
        };
        expect(Company._filterWhereBuilder(criteria)).toEqual({
            where: "WHERE num_employees <= $1",
            vals: [10],
        });
    });
    test("works when all criteria options supplied", function () {
        const criteria = {
            minEmployees: 1,
            maxEmployees: 10,
            name: "Apple",
        };
        expect(Company._filterWhereBuilder(criteria)).toEqual({
            where: "WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3",
            vals: [1, 10, "%Apple%"],
        });
    });
});
/************************************** findAll */
/**
 *  NOTE: Some of the find all tests are already handled
 *  now that we're testing the filter criteria at
 *  a lower level with _filterWhereBuilder.
 *
 *  We've decided these tests are still useful and
 *  all should continue to pass.
 */
describe("findAll", function () {
    test("works: all", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let companies = yield Company.findAll();
            expect(companies).toEqual([
                {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
                {
                    handle: "c2",
                    name: "C2",
                    description: "Desc2",
                    numEmployees: 2,
                    logoUrl: "http://c2.img",
                },
                {
                    handle: "c3",
                    name: "C3",
                    description: "Desc3",
                    numEmployees: 3,
                    logoUrl: "http://c3.img",
                },
            ]);
        });
    });
    test("works: by min employees", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let companies = yield Company.findAll({ minEmployees: 2 });
            expect(companies).toEqual([
                {
                    handle: "c2",
                    name: "C2",
                    description: "Desc2",
                    numEmployees: 2,
                    logoUrl: "http://c2.img",
                },
                {
                    handle: "c3",
                    name: "C3",
                    description: "Desc3",
                    numEmployees: 3,
                    logoUrl: "http://c3.img",
                },
            ]);
        });
    });
    test("works: by max employees", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let companies = yield Company.findAll({ maxEmployees: 2 });
            expect(companies).toEqual([
                {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
                {
                    handle: "c2",
                    name: "C2",
                    description: "Desc2",
                    numEmployees: 2,
                    logoUrl: "http://c2.img",
                },
            ]);
        });
    });
    test("works: by min-max employees", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let companies = yield Company.findAll({ minEmployees: 1, maxEmployees: 1 });
            expect(companies).toEqual([
                {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            ]);
        });
    });
    test("works: by name", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let companies = yield Company.findAll({ name: "1" });
            expect(companies).toEqual([
                {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            ]);
        });
    });
    test("works: empty list on nothing found", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let companies = yield Company.findAll({ name: "nope" });
            expect(companies).toEqual([]);
        });
    });
    test("bad request if invalid min > max", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Company.findAll({ minEmployees: 10, maxEmployees: 1 });
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof BadRequestError).toBeTruthy();
            }
        });
    });
});
/************************************** get */
describe("get", function () {
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let company = yield Company.get("c1");
            expect(company).toEqual({
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
                jobs: [
                    { id: testJobIds[0], title: "Job1", salary: 100, equity: "0.1" },
                    { id: testJobIds[1], title: "Job2", salary: 200, equity: "0.2" },
                    { id: testJobIds[2], title: "Job3", salary: 300, equity: "0" },
                    { id: testJobIds[3], title: "Job4", salary: null, equity: null },
                ],
            });
        });
    });
    test("not found if no such company", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Company.get("nope");
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
        name: "New",
        description: "New Description",
        numEmployees: 10,
        logoUrl: "http://new.img",
    };
    test("works", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let company = yield Company.update("c1", updateData);
            expect(company).toEqual(Object.assign({ handle: "c1" }, updateData));
            const result = yield db.query(`SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
            expect(result.rows).toEqual([{
                    handle: "c1",
                    name: "New",
                    description: "New Description",
                    num_employees: 10,
                    logo_url: "http://new.img",
                }]);
        });
    });
    test("works: null fields", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const updateDataSetNulls = {
                name: "New",
                description: "New Description",
                numEmployees: null,
                logoUrl: null,
            };
            let company = yield Company.update("c1", updateDataSetNulls);
            expect(company).toEqual(Object.assign({ handle: "c1" }, updateDataSetNulls));
            const result = yield db.query(`SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
            expect(result.rows).toEqual([{
                    handle: "c1",
                    name: "New",
                    description: "New Description",
                    num_employees: null,
                    logo_url: null,
                }]);
        });
    });
    test("not found if no such company", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Company.update("nope", updateData);
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
                yield Company.update("c1", {});
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
            yield Company.remove("c1");
            const res = yield db.query("SELECT handle FROM companies WHERE handle='c1'");
            expect(res.rows.length).toEqual(0);
        });
    });
    test("not found if no such company", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Company.remove("nope");
                throw new Error("fail test, you shouldn't get here");
            }
            catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
    });
});
//# sourceMappingURL=company.test.js.map