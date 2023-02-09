"use strict";
/** ExpressError extends normal JS error so we can
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.BadRequestError = exports.UnauthorizedError = exports.NotFoundError = exports.ExpressError = void 0;
class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}
exports.ExpressError = ExpressError;
/** 404 NOT FOUND error. */
class NotFoundError extends ExpressError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
/** 401 UNAUTHORIZED error. */
class UnauthorizedError extends ExpressError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/** 400 BAD REQUEST error. */
class BadRequestError extends ExpressError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
/** 403 BAD REQUEST error. */
class ForbiddenError extends ExpressError {
    constructor(message = "Bad Request") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=expressError.js.map