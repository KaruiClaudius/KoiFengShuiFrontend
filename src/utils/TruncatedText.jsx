import React from "react";

const TruncatedText = ({ text, maxLength = 20 }) => {
  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return <span title={text}>{text.slice(0, maxLength)}...</span>;
};

export default TruncatedText;
