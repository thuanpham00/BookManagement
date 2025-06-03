import { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  nameButton?: string
  classNameButton?: string
  className?: string
  icon?: React.ReactNode
}

export default function Button({
  nameButton,
  className,
  classNameButton = "p-4 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200",
  disabled,
  icon,
  ...rest
}: ButtonProps) {
  return (
    <div className={className}>
      <button
        className={disabled ? classNameButton + " cursor-not-allowed" : classNameButton}
        {...rest}
        disabled={disabled}
      >
        {icon}
        {nameButton}
      </button>
    </div>
  )
}
