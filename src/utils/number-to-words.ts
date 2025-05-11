/**
 * Chuyển đổi số thành chữ tiếng Việt
 * @param number Số cần chuyển đổi
 * @returns Chuỗi chữ tiếng Việt
 */
export function numberToVietnameseWords(number: number): string {
  if (number === 0) return 'không đồng';
  if (isNaN(number)) return 'không hợp lệ';
  if (number < 0) return 'âm ' + numberToVietnameseWords(Math.abs(number));

  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  // Hàm chuyển đổi số có 3 chữ số thành chữ
  function convertGroup(num: number): string {
    let result = '';
    
    // Xử lý hàng trăm
    if (num >= 100) {
      result += units[Math.floor(num / 100)] + ' trăm ';
      num %= 100;
      
      // Nếu còn dư và dư < 10, thêm 'lẻ'
      if (num > 0 && num < 10) {
        result += 'lẻ ';
      }
    }
    
    // Xử lý hàng chục và đơn vị
    if (num >= 10 && num < 20) {
      result += teens[num - 10];
    } else if (num >= 20) {
      result += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        // Đặc biệt cho số 5 ở vị trí đơn vị
        if (num % 10 === 5) {
          result += ' lăm';
        } else if (num % 10 === 1) {
          result += ' mốt';
        } else {
          result += ' ' + units[num % 10];
        }
      }
    } else if (num > 0) {
      result += units[num];
    }
    
    return result.trim();
  }

  // Chia số thành các nhóm 3 chữ số và chuyển đổi
  let result = '';
  let groupCount = 0;
  
  while (number > 0) {
    const group = number % 1000;
    if (group > 0) {
      const groupText = convertGroup(group);
      if (groupCount > 0) {
        result = groupText + ' ' + scales[groupCount] + (result ? ' ' + result : '');
      } else {
        result = groupText;
      }
    }
    
    number = Math.floor(number / 1000);
    groupCount++;
  }
  
  return result + ' đồng';
}

/**
 * Định dạng số với dấu phân cách hàng nghìn
 * @param number Số cần định dạng
 * @returns Chuỗi đã định dạng
 */
export function formatNumberWithCommas(number: number | string): string {
  if (typeof number === 'string') {
    // Loại bỏ tất cả các dấu phân cách hiện có
    number = number.replace(/,/g, '');
    
    // Nếu chuỗi rỗng, trả về '0'
    if (!number) return '0';
    
    // Chuyển đổi chuỗi thành số
    const numValue = parseFloat(number);
    
    // Nếu không phải số hợp lệ, trả về '0'
    if (isNaN(numValue)) return '0';
    
    // Định dạng số với dấu phân cách hàng nghìn
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Nếu là số, chuyển đổi thành chuỗi và định dạng
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Chuyển đổi chuỗi có dấu phân cách thành số
 * @param formattedNumber Chuỗi số có dấu phân cách
 * @returns Số
 */
export function parseFormattedNumber(formattedNumber: string): number {
  // Loại bỏ tất cả các dấu phân cách
  const numberString = formattedNumber.replace(/,/g, '');
  
  // Chuyển đổi chuỗi thành số
  return parseFloat(numberString);
}
