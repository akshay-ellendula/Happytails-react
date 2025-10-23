import jwt from 'jsonwebtoken'
const protectRoute = (roles = []) => {
    return (req, res, next) => {
        const token = req.cookies.jwt; /// req.cookies.{cookie name}
        if (!token) {
            return res.status(401).json({ message: "Not authenticated" })
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log(decoded)
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'You are not authorisied' });
            }
            req.user = decoded;
            console.log("Decode :", decoded);
            console.log(req.user)
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
}

export default protectRoute;