import jwt from "jsonwebtoken";
import createResponse from "../helpers/responseHelper";
require("dotenv").config();

const createJWT = (id, fullName, permissions) => {
  const payload = {
    id: id,
    username: fullName,
    permissions: permissions,
    iat: Math.floor(Date.now() / 1000),
  };

  const key = process.env.JWT_SECRET;

  try {
    const token = jwt.sign(payload, key, { expiresIn: "2h" }); // Thời gian sống token 2h
    return token;
  } catch (error) {
    console.error("Error generating JWT user", error);
    return null;
  }
};

const verifyToken = (permission) => {
  return async (req, res, next) => {
    try {
      // const token = req.cookies.Jwt;
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json(createResponse(-1, "Không tìm thấy Token hoặc Token không hợp lệ", null));
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json(createResponse(-1, "Token không hợp lệ", null));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!decoded.permissions || !decoded.permissions.includes(permission)) {
        return res.status(403).json(createResponse(-1, "Quyền truy cập bị từ chối", null));
      }

      next();
    } catch (error) {
      console.error("Lỗi khi xác minh mã JWT:", error);
      return res.status(401).json(createResponse(-1, "Token không hợp lệ", null));
    }
  };
};

module.exports = {
  createJWT,
  verifyToken,
};
