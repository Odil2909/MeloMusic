import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: IconName;
}

export function IconButton({
  label,
  icon,
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`icon-button ${className}`}
      title={label}
      type={type}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}
