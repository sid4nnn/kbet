import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const COOKIE = "auth";
export function requireAuth(req, res, next) {
    const token = req.cookies?.[COOKIE];
    if (!token)
        return res.status(401).json({ msg: "Not authenticated" });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.sub, role: payload.role };
        next();
    }
    catch {
        res.status(401).json({ msg: "Invalid token" });
    }
}
export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ msg: "Not authenticated" });
        if (req.user.role !== role)
            return res.status(403).json({ msg: "Forbidden" });
        next();
    };
}
//# sourceMappingURL=auth.js.map