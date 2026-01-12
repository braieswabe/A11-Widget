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
      >
        <defs>
          {/* Friendly gradient for outer circle */}
          <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B8DD6" />
            <stop offset="100%" stopColor="#8B6FD8" />
          </linearGradient>
          {/* Soft shadow */}
          <filter id="softShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer circle (badge) - friendly purple-blue gradient */}
        <circle cx="50" cy="50" r="45" fill="url(#outerGradient)" stroke="#5A7BC8" strokeWidth="1.5" filter="url(#softShadow)" />
        
        {/* Inner white circle with soft shadow */}
        <circle cx="50" cy="50" r="33" fill="#FFFFFF" opacity="0.95" />
        
        {/* Human figure icon with friendly smile */}
        <g fill="#6B8DD6" stroke="#6B8DD6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Head (circular with friendly face) */}
          <circle cx="50" cy="36" r="5.5" fill="#FFFFFF" stroke="#6B8DD6" strokeWidth="2" />
          
          {/* Friendly smile */}
          <path d="M 46 38 Q 50 40, 54 38" stroke="#6B8DD6" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Eyes */}
          <circle cx="47.5" cy="35" r="1" fill="#6B8DD6" />
          <circle cx="52.5" cy="35" r="1" fill="#6B8DD6" />
          
          {/* Torso (vertical line) */}
          <line x1="50" y1="41.5" x2="50" y2="52" strokeWidth="2.8" />
          
          {/* Arms (welcoming/open pose) */}
          <line x1="50" y1="44" x2="40" y2="46" strokeWidth="3" />
          <line x1="50" y1="44" x2="60" y2="46" strokeWidth="3" />
          
          {/* Legs (slightly apart, friendly stance) */}
          <line x1="50" y1="52" x2="44" y2="61" strokeWidth="3" />
          <line x1="50" y1="52" x2="56" y2="61" strokeWidth="3" />
        </g>
        
        {/* Sparkle/star elements for friendliness */}
        <g fill="#FFD700" opacity="0.8">
          {/* Top sparkle */}
          <circle cx="30" cy="25" r="1.5" />
          <path d="M 30 25 L 30 22 M 30 25 L 30 28 M 30 25 L 27 25 M 30 25 L 33 25" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Right sparkle */}
          <circle cx="75" cy="30" r="1.5" />
          <path d="M 75 30 L 75 27 M 75 30 L 75 33 M 75 30 L 72 30 M 75 30 L 78 30" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        
        {/* Curved arc (motion/flow element) - softer and friendlier */}
        <path 
          d="M 65 28 Q 70 23, 75 28" 
          stroke="#8B6FD8" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round"
          opacity="0.7"
        />
        
        {/* Accessibility symbol - friendly "A" with heart */}
        <g fill="#6B8DD6" fontFamily="Arial, sans-serif" fontWeight="bold">
          {/* Small "A" */}
          <text x="30" y="28" fontSize="9" textAnchor="middle" fill="#6B8DD6">A</text>
          
          {/* Small heart instead of character */}
          <path d="M 30 35 Q 30 32, 32 32 Q 34 32, 34 35 Q 34 32, 36 32 Q 38 32, 38 35 Q 38 38, 34 42 Q 30 38, 30 35" 
                fill="#FF6B9D" opacity="0.8" />
        </g>
      </svg>
    </div>
  )
}
