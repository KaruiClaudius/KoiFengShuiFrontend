import React from "react";

const countVietnameseCharacters = (str) => {
  // This regex matches Vietnamese characters and counts them as single characters
  const vietnameseRegex = /[\p{L}\p{M}]+/gu;
  const matches = str.match(vietnameseRegex);
  return matches ? matches.length : 0;
};

const truncateVietnameseText = (str, maxLength) => {
  const chars = str.match(/[\p{L}\p{M}]+|./gu);
  if (chars.length <= maxLength) return str;
  return chars.slice(0, maxLength).join("") + "...";
};

const TruncatedText = ({ text, maxLength }) => {
  const vietnameseLength = countVietnameseCharacters(text);

  if (vietnameseLength <= maxLength) {
    return <span>{text}</span>;
  }

  const truncatedText = truncateVietnameseText(text, maxLength);

  return <span title={text}>{truncatedText}</span>;
};

export default TruncatedText;
