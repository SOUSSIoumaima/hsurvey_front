import React from 'react';

/**
 * Button reusable component
 * @param {function} onClick - Click handler
 * @param {JSX.Element} icon - Optional icon to display left of label
 * @param {string} label - Button text
 * @param {string} variant - 'primary' | 'secondary' | 'danger'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} fullWidth - Make button full width
 * @param {string} className - Additional classes
 * @param {object} rest - Other button props
 */
const Button = ({
  onClick,
  icon: Icon,
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) => {
  const base = 'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const width = fullWidth ? 'w-full justify-center' : '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${width} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label || children}
    </button>
  );
};

export default Button; 