const connection = require("../connectDBMySQL");

import { createJWT } from "../middleware/authentication";
import createResponse from "../helpers/responseHelper";
const bcrypt = require("bcrypt");
const saltRounds = 10; // Số vòng hash cho bcrypt

// Hàm để hash mật khẩu
const handleHashPassword = async (password) => {
  return bcrypt.hash(password, saltRounds);
};

const checkUserNameExists = async (userName) => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM user WHERE userName = ?", [userName], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

const registerUser = async (req, res) => {
  const { fullName, userName, password, email, phone, address, gender } = req.body;

  try {
    // Kiểm tra xem tất cả các trường có được cung cấp không
    if (!fullName || !userName || !password || !email || !phone || !address) {
      return res.status(400).json(createResponse(-1, "Thiếu trường dữ liệu", null));
    }

    // Kiểm tra xem userName có tồn tại hay không
    const userExists = await checkUserNameExists(userName);
    if (userExists) {
      return res.status(400).json(createResponse(-2, "Tên người dùng đã tồn tại", null));
    }

    // Hash mật khẩu
    const hashedPassword = await handleHashPassword(password);

    // Tạo câu lệnh SQL để chèn người dùng mới vào cơ sở dữ liệu
    const query =
      "INSERT INTO user (fullName, userName, password, email, phone, address, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Normal')";
    const values = [fullName, userName, hashedPassword, email, phone, JSON.stringify(address), gender || "Male"];

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json(createResponse(-5, "Lỗi khi tạo người dùng", null));
      }

      return res.status(201).json(
        createResponse(0, "Tạo người dùng thành công", {
          id: results.insertId,
          fullName,
          userName,
          email,
          phone,
          address,
          gender: gender || "Male",
          status: "Normal",
        })
      );
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi tạo người dùng", null));
  }
};

const loginUser = async (req, res) => {
  const { userName, password } = req.body;

  try {
    // Kiểm tra xem userName và password có được cung cấp không
    if (!userName || !password) {
      return res.status(400).json(createResponse(-1, "Thiếu trường dữ liệu", null));
    }

    // Kiểm tra xem userName có tồn tại hay không
    const user = await checkUserNameExists(userName);
    if (!user) {
      return res.status(401).json(createResponse(-2, "Tên người dùng không tồn tại", null));
    }

    // Kiểm tra xem có bị khóa
    if (user.status !== "Normal") {
      return res.status(401).json(createResponse(-2, "Tài khoản đang bị khóa", null));
    }

    // So sánh mật khẩu cung cấp với mật khẩu đã mã hóa trong cơ sở dữ liệu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(createResponse(-2, "Tên người dùng hoặc mật khẩu không chính xác", null));
    }

    // Tạo token JWT
    const permissions = ["manager_role", "user_role"]; // Thêm các quyền nếu có
    const token = createJWT(user.id, user.fullName, permissions);

    return res.status(200).json(createResponse(0, "Đăng nhập thành công", { token }));
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi đăng nhập", null));
  }
};

const changePasswordUser = async (req, res) => {
  const { userName, currenPassword, newPassword } = req.body;

  try {
    // Kiểm tra xem tất cả các trường có được cung cấp không
    if (!userName || !currenPassword || !newPassword) {
      return res.status(400).json(createResponse(-1, "Thiếu trường dữ liệu", null));
    }

    // Kiểm tra xem userName có tồn tại hay không
    const user = await checkUserNameExists(userName);
    if (!user) {
      return res.status(400).json(createResponse(-1, "Tên người dùng không tồn tại", null));
    }

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(currenPassword, user.password);
    if (!isMatch) {
      return res.status(400).json(createResponse(-2, "Mật khẩu cũ không đúng", null));
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới trong cơ sở dữ liệu
    connection.query("UPDATE user SET password = ? WHERE userName = ?", [hashedPassword, userName], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json(createResponse(-5, "Lỗi khi cập nhật mật khẩu", null));
      }

      return res.status(200).json(createResponse(0, "Thay đổi mật khẩu thành công", null));
    });
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi thay đổi mật khẩu", null));
  }
};

module.exports = {
  loginUser,
  registerUser,
  changePasswordUser,
};
