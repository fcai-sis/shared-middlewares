import * as validator from "express-validator";
import { NextFunction, Request, Response } from "express";



export type PaginationQueryParams = {query: {page: number, pageSize: number}};

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
    .withMessage("Missing query parameter page")

    // Ensure that the `page` query parameter is an integer
    .isInt({ min: 1 })
    .withMessage("Query parameter page must be an integer greater than 0"),

  validator
    // Get the `pageSize` query parameter
    .query("pageSize")

    // Ensure that the `pageSize` query parameter exists
    .exists()
    .withMessage("Missing query parameter pageSize")

    // Ensure that the `pageSize` query parameter is an integer
    .isInt({ min: 1 })
    .withMessage("Query parameter pageSize must be an integer greater than 0"),


  (req: Request&PaginationQueryParams, res: Response, next: NextFunction) => {

    // If any of the validations above failed, return an error response
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: errors.array()[0].msg,
        },
      });
    }
    next();
  },
];

export { middlewares as paginationQueryParamsMiddleware }
