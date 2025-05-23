/**
 * Tính thời gian đã trôi qua từ một thời điểm đến hiện tại hoặc đến một thời điểm kết thúc
 * @param startDate Thời điểm bắt đầu
 * @param endDate Thời điểm kết thúc (mặc định là thời điểm hiện tại)
 * @returns Chuỗi thời gian đã trôi qua (ví dụ: "12 giờ 30 phút")
 */
export function getElapsedTime(startDate: string | Date, endDate?: string | Date): string {
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : new Date().getTime();

  // Tính thời gian đã trôi qua tính bằng mili giây
  const elapsed = end - start;

  // Chuyển đổi thành giây, phút, giờ
  const seconds = Math.floor((elapsed / 1000) % 60);
  const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
  const hours = Math.floor(elapsed / (1000 * 60 * 60));

  // Tạo chuỗi kết quả, chỉ hiển thị giờ và phút, bỏ giây
  let result = '';

  if (hours > 0) {
    result += `${hours} giờ `;
  }

  if (minutes > 0 || (hours > 0 && minutes === 0)) {
    result += `${minutes} phút`;
  }

  // Nếu cả giờ và phút đều bằng 0, hiển thị "dưới 1 phút"
  if (result === '') {
    result = 'dưới 1 phút';
  }

  return result.trim();
}

/**
 * Tính thời gian từ thời điểm bắt đầu đến thời điểm kết thúc
 * @param startDate Thời điểm bắt đầu
 * @param endDate Thời điểm kết thúc
 * @returns Chuỗi thời gian giữa hai thời điểm (ví dụ: "2 ngày 5 giờ 30 phút")
 */
export function getTimeBetween(startDate: string | Date, endDate: string | Date): string {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  // Tính thời gian giữa hai thời điểm tính bằng mili giây
  const elapsed = end - start;

  // Chuyển đổi thành giây, phút, giờ
  const seconds = Math.floor((elapsed / 1000) % 60);
  const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
  const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));

  // Tạo chuỗi kết quả, chỉ hiển thị ngày, giờ và phút, bỏ giây
  let result = '';

  if (days > 0) {
    result += `${days} ngày `;
  }

  if (hours > 0) {
    result += `${hours} giờ `;
  }

  if (minutes > 0 || (hours > 0 && minutes === 0) || (days > 0 && hours === 0 && minutes === 0)) {
    result += `${minutes} phút`;
  }

  // Nếu tất cả đều bằng 0, hiển thị "dưới 1 phút"
  if (result === '') {
    result = 'dưới 1 phút';
  }

  return result.trim();
}

/**
 * Kiểm tra xem thời điểm deadline đã qua hay chưa
 * @param deadline Thời điểm deadline
 * @returns true nếu deadline đã qua, false nếu chưa
 */
export function isDeadlineExpired(deadline: string | Date | undefined | null): boolean {
  if (!deadline) return false;

  const deadlineTime = new Date(deadline).getTime();
  const now = new Date().getTime();

  return now > deadlineTime;
}

/**
 * Cập nhật thời gian đã trôi qua và gán vào element
 * @param element Element cần cập nhật
 * @param startDate Thời điểm bắt đầu
 */
export function updateElapsedTimeElement(element: HTMLElement, startDate: string | Date): void {
  if (!element) return;

  const updateTime = () => {
    element.textContent = getElapsedTime(startDate);
  };

  // Cập nhật ngay lập tức
  updateTime();

  // Cập nhật mỗi giây
  return setInterval(updateTime, 1000);
}

/**
 * Định dạng ngày tháng theo định dạng dd/MM/yyyy
 * @param dateString Chuỗi ngày tháng (YYYY-MM-DD)
 * @returns Chuỗi ngày tháng đã định dạng
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Định dạng ngày tháng với tên tháng
 * @param dateString Chuỗi ngày tháng (YYYY-MM-DD)
 * @returns Chuỗi ngày tháng đã định dạng
 */
export function formatDateWithMonth(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
