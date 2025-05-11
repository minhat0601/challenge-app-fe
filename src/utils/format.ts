/**
 * Định dạng số thành chuỗi tiền tệ
 * @param amount Số tiền cần định dạng
 * @param currency Đơn vị tiền tệ (mặc định: VND)
 * @returns Chuỗi tiền tệ đã định dạng
 */
export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Định dạng số thành chuỗi có dấu phân cách hàng nghìn
 * @param number Số cần định dạng
 * @returns Chuỗi số đã định dạng
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('vi-VN').format(number);
}

/**
 * Định dạng số thành chuỗi phần trăm
 * @param number Số cần định dạng
 * @param fractionDigits Số chữ số thập phân (mặc định: 1)
 * @returns Chuỗi phần trăm đã định dạng
 */
export function formatPercent(number: number, fractionDigits: number = 1): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(number / 100);
}
