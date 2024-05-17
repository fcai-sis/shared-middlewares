enum Role {
  ADMIN = "admin",
  STUDENT = "student",
  EMPLOYEE = "employee",
  INSTUCTOR = "instructor",
  TEACHING_ASSISTANT = "teachingAssistant",
}

import { Request, Response, NextFunction } from "express";
import jose from "node-jose";


type TokenPayload = { id: string; role: Role };

type MiddlewareRequest = Request<{}, {}, { user?: TokenPayload }>;

function getTokenAuthorizationHeader(req: MiddlewareRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return undefined;
  const token = authHeader.split(" ");

  if (token.length == 2 && token[0] == "Bearer") {
    return token[1];
  }

  return undefined;
}

/**
 * Checks if the user has one of the required roles
 *
 * @param requiredRoles The list of roles that are allowed to access the resource
 * @returns A middleware function that checks if the user has one of the required roles
 */
const checkRole = (requiredRoles: Role[]) => {
  return async (req: MiddlewareRequest, res: Response, next: NextFunction) => {
    const key = await jose.JWK.createKey('oct', 256, { alg: 'A256GCM', use: 'enc' });

    // Extract JWT token from the request cookies
    const token = req.cookies.token ?? getTokenAuthorizationHeader(req);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token not provided" });
    }

    try {
      // Verify JWT token and decode payload
      const result = await jose.JWE.createDecrypt(key).decrypt(token);
      const decodedToken = JSON.parse(result.payload.toString()) as TokenPayload;

      // Fetch user's role from the decoded token
      const userRole = decodedToken.role;

      // Check if the user's role matches any of the required roles
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          message: `Unauthorized: User must be any of the following: ${requiredRoles.join(
            ", "
          )}`,
        });
      }

      // Attach userId and role to the request object for further processing
      req.body.user = { id: decodedToken.id, role: userRole };

      next(); // User has one of the required roles, proceed to the next middleware or route handler
    } catch (error) {
      console.error("Authorization failed:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

export { checkRole, Role, TokenPayload };
