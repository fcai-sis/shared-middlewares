import * as validator from "express-validator";
import { NextFunction, Request, Response } from "express";

/**
 * Ensures that the request query parameters `page` and `pageSize` exists and are valid.
 * Also attaches the query parameters to the request body.
 *
 * @returns `400 Bad Request` if the query parameters are missing or invalid
 */
const middlewares = [
  validator
    // Get the `page` query parameter
    .query("page")

    // Ensure that the `page` query parameter exists
    .exists()
    .withMessage(1)

    // Ensure that the `page` query parameter is an integer
    .isInt({ min: 1 })
    .withMessage(2),

  validator
    // Get the `pageSize` query parameter
    .query("pageSize")

    // Ensure that the `pageSize` query parameter exists
    .exists()
    .withMessage(3)

    // Ensure that the `pageSize` query parameter is an integer
    .isInt({ min: 1 })
    .withMessage(4),

  (req: Request, res: Response, next: NextFunction) => {

    // If any of the validations above failed, return an error response
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    // Attach the pagination query params to the request body
    req.body.page = parseInt(req.query.page as string);
    req.body.pageSize = parseInt(req.query.pageSize as string);

    next();
  },
];

export { middlewares as paginationQueryParamsMiddleware }
