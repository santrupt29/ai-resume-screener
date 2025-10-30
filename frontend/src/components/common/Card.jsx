// // src/components/common/Card.jsx
// import React from 'react';

// export const Card = ({ children, className = '', ...props }) => {
//   return (
//     <div
//       className={`bg-white rounded-lg shadow ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// };

// export const CardHeader = ({ children, className = '', ...props }) => {
//   return (
//     <div
//       className={`px-6 py-4 border-b ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// };

// export const CardTitle = ({ children, className = '', ...props }) => {
//   return (
//     <h3
//       className={`text-lg font-medium leading-6 text-gray-900 ${className}`}
//       {...props}
//     >
//       {children}
//     </h3>
//   );
// };

// export const CardDescription = ({ children, className = '', ...props }) => {
//   return (
//     <p
//       className={`mt-1 text-sm text-gray-500 ${className}`}
//       {...props}
//     >
//       {children}
//     </p>
//   );
// };

// export const CardContent = ({ children, className = '', ...props }) => {
//   return (
//     <div
//       className={`px-6 py-4 ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// };

// Card.Header = CardHeader;
// Card.Title = CardTitle;
// Card.Description = CardDescription;
// Card.Content = CardContent;

// export default Card;




// src/components/common/Card.jsx
import React from 'react';

// Main Card: includes border, strong shadow, animated hover, and colored accent
export const Card = ({
  children,
  className = '',
  accentColor = 'primary',
  hoverable = true,
  ...props
}) => {
  const accent =
    accentColor === 'primary'
      ? 'bg-gradient-to-b from-primary-100 to-white'
      : accentColor === 'blue'
      ? 'bg-gradient-to-b from-blue-100 to-white'
      : accentColor === 'green'
      ? 'bg-gradient-to-b from-green-100 to-white'
      : 'bg-gray-50';
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-100 shadow-md transition-all ${
        hoverable ? 'hover:shadow-xl hover:-translate-y-0.5' : ''
      } ${accent} ${className}`}
      {...props}
    >
      {/* Decorative holographic side accent */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 z-10 ${
          accentColor === 'primary'
            ? 'bg-gradient-to-b from-primary-400 to-primary-200'
            : accentColor === 'blue'
            ? 'bg-gradient-to-b from-blue-400 to-blue-200'
            : accentColor === 'green'
            ? 'bg-gradient-to-b from-green-400 to-green-200'
            : 'bg-gray-200'
        }`}
      />
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  icon,
  className = '',
  ...props
}) => (
  <div
    className={`flex items-center gap-3 px-7 py-5 bg-white border-b border-gray-100 ${className}`}
    {...props}
  >
    {/* Optional icon circle */}
    {icon && (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 shrink-0 shadow-sm ring-1 ring-primary-50">
        {icon}
      </div>
    )}
    <div className="flex-1">{children}</div>
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3
    className={`text-xl md:text-2xl font-extrabold leading-tight text-gray-900 tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({
  children,
  className = '',
  ...props
}) => (
  <p
    className={`mt-2 text-base text-gray-500 font-medium tracking-wide ${className}`}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-7 py-6 bg-white/95 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Compound assignment for accessibility
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;

export default Card;
