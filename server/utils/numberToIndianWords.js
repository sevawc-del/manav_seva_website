const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const twoDigitWords = (num) => {
  if (num < 20) return ONES[num];
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  return ones ? `${TENS[tens]} ${ONES[ones]}` : TENS[tens];
};

const threeDigitWords = (num) => {
  if (num < 100) return twoDigitWords(num);
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  return remainder
    ? `${ONES[hundreds]} hundred ${twoDigitWords(remainder)}`
    : `${ONES[hundreds]} hundred`;
};

const numberToIndianWords = (num) => {
  if (!Number.isFinite(num) || num < 0) return '';
  if (num === 0) return 'zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  const parts = [];
  if (crore) parts.push(`${numberToIndianWords(crore)} crore`);
  if (lakh) parts.push(`${numberToIndianWords(lakh)} lakh`);
  if (thousand) parts.push(`${numberToIndianWords(thousand)} thousand`);
  if (hundred) parts.push(threeDigitWords(hundred));

  return parts.join(' ').trim();
};

const amountToIndianWords = (amount) => {
  if (!Number.isFinite(amount) || amount <= 0) return '';
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const rupeeWords = `${numberToIndianWords(rupees)} rupees`;
  if (!paise) {
    return `${rupeeWords} only`;
  }

  return `${rupeeWords} and ${numberToIndianWords(paise)} paise only`;
};

module.exports = {
  numberToIndianWords,
  amountToIndianWords
};
