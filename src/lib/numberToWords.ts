const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function readGroup(num: number): string {
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const one = num % 10;
  let result = '';

  if (hundred > 0) {
    result += ones[hundred] + ' trăm';
    if (ten === 0 && one > 0) result += ' lẻ';
  }

  if (ten > 1) {
    result += ' ' + ones[ten] + ' mươi';
    if (one === 1) result += ' mốt';
    else if (one === 5) result += ' lăm';
    else if (one > 0) result += ' ' + ones[one];
  } else if (ten === 1) {
    result += ' mười';
    if (one === 5) result += ' lăm';
    else if (one > 0) result += ' ' + ones[one];
  } else if (one > 0 && hundred > 0) {
    result += ' ' + ones[one];
  } else if (one > 0) {
    result += ones[one];
  }

  return result.trim();
}

export function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'không đồng';
  if (isNaN(num) || num < 0) return '';

  num = Math.floor(num);
  const groups: number[] = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      // Add leading zero handling for middle groups
      if (i < groups.length - 1 && groups[i] < 100 && groups[i] > 0) {
        if (groups[i] < 10) result += 'không trăm lẻ ';
        else result += 'không trăm ';
      }
      result += readGroup(groups[i]);
      if (units[i]) result += ' ' + units[i];
      result += ' ';
    }
  }

  result = result.trim();
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result + ' đồng./.';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}
