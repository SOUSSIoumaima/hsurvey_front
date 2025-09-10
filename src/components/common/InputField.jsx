import React from 'react';

/**
 * InputField reusable component
 * @param {string} label - The label for the input
 * @param {JSX.Element} icon - Optional icon to display inside the input
 * @param {string} error - Optional error message
 * @param {string} id - The id for the input
 * @param {object} inputProps - All other input props
 */
const InputField = ({
  label,
  icon: Icon,
  error,
  id,
  className = '',
  ...inputProps
}) => (
  <div>
    {label && (
      <label htmlFor={id} className="label-base">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        id={id}
        className={`input-base ${Icon ? 'pl-10' : ''} ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'} ${className}`}
        {...inputProps}
      />
    </div>
    {error && <p className="bg-red-100 border border-red-300 text-red-700 px-3 py-1 rounded mt-1 text-sm animate-fade-in">{error}</p>}
  </div>
);

export default InputField; 