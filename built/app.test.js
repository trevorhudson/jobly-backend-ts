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
const app = require("./app");
const db = require("./db");
test("not found for site 404", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield request(app).get("/no-such-path");
        expect(resp.statusCode).toEqual(404);
    });
});
test("not found for site 404 (test stack print)", function () {
    return __awaiter(this, void 0, void 0, function* () {
        process.env.NODE_ENV = "";
        const resp = yield request(app).get("/no-such-path");
        expect(resp.statusCode).toEqual(404);
        delete process.env.NODE_ENV;
    });
});
afterAll(function () {
    db.end();
});
//# sourceMappingURL=app.test.js.map