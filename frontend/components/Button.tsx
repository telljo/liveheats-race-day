import React from "react";

export default function Button({
  variant = "primary",
  size = "md",
  ...props
}) {
  return (
    <button
      className={`button button--${variant} button--${size}`}
      {...props}
    />
  );
}
