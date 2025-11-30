import { Request, Response, NextFunction } from "express";
export interface AuthedRequest extends Request {
    user?: {
        id: string;
        role: "player" | "admin";
    };
}
export declare function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireRole(role: "admin" | "player"): (req: AuthedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map