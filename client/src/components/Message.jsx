import React from "react";

export default function Message({ text, error = false }) {
  if (!text) return null;
  return <p className={error ? "message error" : "message"}>{text}</p>;
}
