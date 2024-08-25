/**
 * Tạo một JSON phản hồi chuẩn.
 * @param {number} status - Trạng thái của yêu cầu.
 * @param {string} message - Thông điệp mô tả kết quả.
 * @param {any} data - Dữ liệu trả về (nếu có).
 * @returns {Object} Đối tượng JSON phản hồi.
 */
function createResponse(status, message, data = null) {
    return {
        status,
        message,
        data,
    };
}

export default createResponse;

/**
 * Về status
 * -5 : Lỗi server
 * -4: Không có quyền thực hiện chức năng ( jwt)
 * -3: Token không hợp lệ
 * -1: Thiếu dữ liệu
 * 0: Thành công
 * ...
 * 
 */