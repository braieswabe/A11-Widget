import './A11yLogo.css'

interface A11yLogoProps {
  size?: number
  className?: string
}

export default function A11yLogo({ size = 48, className = '' }: A11yLogoProps) {
  return (
    <div className={`a11y-logo ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" fill="#21A1E1" />
        <circle cx="50" cy="29" r="7" fill="#ffffff" />
        <line x1="50" y1="36" x2="50" y2="54" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="42" x2="27" y2="46" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="42" x2="73" y2="46" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="54" x2="38" y2="71" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="54" x2="62" y2="71" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  )
}
