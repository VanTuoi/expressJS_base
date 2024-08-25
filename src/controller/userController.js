const connection = require("../connectDBMySQL");

import createResponse from "../helpers/responseHelper";

const getInfor = async (req, res) => {
  const { userName } = req.params;

  try {
    // Kiểm tra xem userName có được cung cấp không
    if (!userName) {
      return res.status(400).json(createResponse(-1, "Thiếu trường dữ liệu", null));
    }

    // Tạo câu lệnh SQL để lấy thông tin người dùng dựa trên userName
    const query = "SELECT * FROM user WHERE userName = ?";
    const values = [userName];

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json(createResponse(-5, "Lỗi khi lấy dữ liệu người dùng", null));
      }

      if (results.length === 0) {
        return res.status(404).json(createResponse(-4, "Người dùng không tồn tại", null));
      }

      // Trả về thông tin người dùng
      return res.status(200).json(createResponse(0, "Lấy dữ liệu người dùng thành công", results[0]));
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(createResponse(-5, "Lỗi khi lấy dữ liệu người dùng", null));
  }
};

module.exports = {
  getInfor,
};
