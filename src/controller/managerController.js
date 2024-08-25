const connection = require("../connectDBMySQL");

import createResponse from "../helpers/responseHelper";

const bcrypt = require("bcrypt");
const saltRounds = 10; // Số vòng hash cho bcrypt

// Hàm để hash mật khẩu
const handleHashPassword = async (password) => {
  return bcrypt.hash(password, saltRounds);
};

const createUser = async (req, res) => {
  const { fullName, userName, password, email, phone, address, gender } = req.body;

  try {
    // Kiểm tra xem tất cả các trường có được cung cấp không
    if (!fullName || !userName || !password || !email || !phone || !address || !gender) {
      return res.status(400).json(createResponse(-1, "Thiếu trường dữ liệu", null));
    }

    // Hash mật khẩu
    const hashedPassword = await handleHashPassword(password);

    // Tạo câu lệnh SQL để chèn người dùng mới vào cơ sở dữ liệu
    const query =
      "INSERT INTO user (fullName, userName, password, email, phone, address, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Normal')";
    const values = [fullName, userName, hashedPassword, email, phone, JSON.stringify(address), gender];

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
          gender,
          status: "Normal",
        })
      );
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi tạo người dùng", null));
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, userName, password, email, phone, address, gender, status } = req.body;

  try {
    // Kiểm tra xem tất cả các trường có được cung cấp không
    if (!fullName || !userName || !password || !email || !phone || !address || !gender || !status) {
      return res.status(400).json(createResponse(-1, "Thiếu trường dữ liệu", null));
    }

    // Hash mật khẩu
    const hashedPassword = await handleHashPassword(password);

    // Tạo câu lệnh SQL để cập nhật người dùng
    const query =
      "UPDATE user SET fullName = ?, userName = ?, password = ?, email = ?, phone = ?, address = ?, gender = ?, status = ? WHERE id = ?";
    const values = [fullName, userName, hashedPassword, email, phone, JSON.stringify(address), gender, status, userId];

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json(createResponse(-5, "Lỗi khi cập nhật dữ liệu người dùng", null));
      }

      if (results.affectedRows === 0) {
        return res.status(404).json(createResponse(-4, "Người dùng không tồn tại", null));
      }

      return res.status(200).json(createResponse(0, "Cập nhật dữ liệu người dùng thành công", null));
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi cập nhật dữ liệu người dùng", null));
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    connection.query("DELETE FROM user WHERE id = ?", [userId], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json(createResponse(-5, "Lỗi khi xóa dữ liệu người dùng", null));
      }

      if (results.affectedRows === 0) {
        return res.status(404).json(createResponse(-4, "Người dùng không tồn tại", null));
      }

      return res.status(200).json(createResponse(0, "Xóa dữ liệu người dùng thành công", null));
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi xóa dữ liệu người dùng", null));
  }
};

const getOneUser = async (req, res) => {
  const { userId } = req.params;

  try {
    connection.query("SELECT * FROM user WHERE id = ?", [userId], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json(createResponse(-5, "Lỗi khi lấy dữ liệu người dùng", null));
      }

      if (results.length === 0) {
        return res.status(404).json(createResponse(-4, "Người dùng không tồn tại", null));
      }

      return res.status(200).json(createResponse(0, "Lấy dữ liệu người dùng thành công", results[0]));
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi lấy dữ liệu người dùng", null));
  }
};

const getAllUsers = async (req, res) => {
  try {
    connection.query("SELECT * FROM user", (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json(createResponse(-5, "Lỗi khi lấy dữ liệu người dùng", null));
      }

      // Trả về phản hồi thành công với tất cả người dùng
      return res.status(200).json(createResponse(0, "Lấy dữ liệu người dùng thành công", results));
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi lấy dữ liệu người dùng", null));
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getOneUser,
  getAllUsers,
};
