import ReactHtmlParser from 'react-html-parser';
export function stringCut(text: string, limit: number, lineLimit: number) {
  const oldLength = text.length;
  let index = -1;
  let newText = '';
  index = text.indexOf('</li>');
  if (index > 0) {
    let substrings = text.split('</li>');

    let i;
    for (i = 0; i < substrings.length && i < lineLimit; i++) {
      newText += substrings[i];
    }
    text = newText + '</ul>';
    limit += 100;
  } else {
    let substrings = text.split('</p>');
    let i;
    for (i = 0; i < substrings.length && i < lineLimit; i++) {
      newText += substrings[i];
    }
    text = newText;
  }

  text = text.substring(0, limit);
  if (text.length >= limit) {
    text = text + '...';
  }

  return ReactHtmlParser(text);
}
export function generateRandomAlphanumeric(length = 20) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

export function ellipsisize(text: string, limit: number) {
  if (text.length > limit) {
    return text.substring(0, limit) + '...';
  } else {
    return text;
  }
}

export function isStringEmpty(str: string) {
  const regex = /^\s*$/;
  return regex.test(str) || str.length === 0;
}
