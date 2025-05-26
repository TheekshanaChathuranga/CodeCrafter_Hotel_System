// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/UserAuthContext';


// const Navbar = () => {
//   const { user, logout } = useAuth();

//   // Color variables
//   const colors = {
//     primary: '#2C3E50',
//     secondary: '#16A085',
//     accent: '#E74C3C',
//     background: '#ECF0F1',
//     text: '#333333',
//     success: '#27AE60',
//     info: '#3498DB',
//     white: '#FFFFFF'
//   };

//   // Hover styles
//   const linkHover = {
//     backgroundColor: '#34495E', // Darker primary
//     transition: 'background-color 0.3s ease'
//   };

//   return (
//     <nav 
//       className="shadow-lg"
//       style={{ backgroundColor: colors.primary }}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Left side - Logo/Brand */}
//           <div className="flex-shrink-0">
//             <Link 
//               to="/" 
//               className="text-xl font-bold"
//               style={{ color: colors.white }}
//             >
//               The Lake Hotel
//             </Link>
//           </div>

//           {/* Center - Navigation Links */}
//           <div className="hidden md:flex items-center space-x-1">
//             <Link 
//               to="/" 
//               className="px-3 py-2 rounded-md text-sm font-medium"
//               style={{ 
//                 color: colors.white,
//                 ':hover': linkHover
//               }}
//             >
//               Home
//             </Link>
            
//             <Link 
//               to="/about" 
//               className="px-3 py-2 rounded-md text-sm font-medium"
//               style={{ 
//                 color: colors.white,
//                 ':hover': linkHover
//               }}
//             >
//               About
//             </Link>

//             {/* Admin Dashboard Button */}
//             {user?.role === 'admin' && (
//               <Link
//                 to="/admin"
//                 className="px-3 py-2 rounded-md text-sm font-medium"
//                 style={{
//                   color: colors.white,
//                   ':hover': linkHover
//                 }}
//               >
//                 Dashboard
//               </Link>
//             )}
//           </div>

//           {/* Right side - Auth Buttons */}
//           <div className="flex items-center space-x-4">
//             {user ? (
//               <>
//                 <span 
//                   className="text-sm font-medium"
//                   style={{ color: colors.white }}
//                 >
//                   Welcome, {user.username}
//                 </span>
//                 <button
//                   onClick={logout}
//                   className="px-4 py-2 rounded-md text-sm font-medium"
//                   style={{
//                     backgroundColor: colors.accent,
//                     color: colors.white,
//                     ':hover': {
//                       backgroundColor: '#C0392B',
//                       transition: 'background-color 0.3s ease'
//                     }
//                   }}
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to="/login"
//                   className="px-4 py-2 rounded-md text-sm font-medium"
//                   style={{
//                     backgroundColor: colors.info,
//                     color: colors.white,
//                     ':hover': {
//                       backgroundColor: '#2980B9',
//                       transition: 'background-color 0.3s ease'
//                     }
//                   }}
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/signup"
//                   className="px-4 py-2 rounded-md text-sm font-medium"
//                   style={{
//                     backgroundColor: colors.success,
//                     color: colors.white,
//                     ':hover': {
//                       backgroundColor: '#219955',
//                       transition: 'background-color 0.3s ease'
//                     }
//                   }}
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/UserAuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Color variables
  const colors = {
    primary: '#2C3E50',
    secondary: '#16A085',
    accent: '#E74C3C',
    background: '#ECF0F1',
    text: '#333333',
    success: '#27AE60',
    info: '#3498DB',
    white: '#FFFFFF'
  };

  // Hover styles
  const linkHover = {
    backgroundColor: '#34495E',
    transition: 'background-color 0.3s ease'
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav 
      className="shadow-lg"
      style={{ backgroundColor: colors.primary, color: colors.white }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src="/src/img/logo.jpg" 
              alt="Logo" 
              className="h-8 w-8 rounded-full"
            />
            <Link 
              to="/" 
              className="ml-2 text-xl font-bold"
              style={{ color: colors.white }}
            >
              The Lake Resort
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" hoverStyle={linkHover}>
              Home
            </NavLink>
            <NavLink to="/room-booking" hoverStyle={linkHover}>
              Room Booking
            </NavLink>
            <NavLink to="/pool-booking" hoverStyle={linkHover}>
              Pool Booking
            </NavLink>
            <NavLink to="/event-booking" hoverStyle={linkHover}>
              Event Booking
            </NavLink>
            <NavLink to="/about" hoverStyle={linkHover}>
              About
            </NavLink>
            <NavLink to="/contact" hoverStyle={linkHover}>
              Contact
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" hoverStyle={linkHover}>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Right side - Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm font-medium">
                  Welcome, {user.username}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    ':hover': { backgroundColor: '#C0392B' }
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <AuthLink to="/login" color={colors.info}>
                  Login
                </AuthLink>
                <AuthLink to="/signup" color={colors.success}>
                  Sign Up
                </AuthLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-2">
            <MobileLink to="/" onClick={toggleMenu}>
              Home
            </MobileLink>
            <MobileLink to="/room-booking" onClick={toggleMenu}>
              Room Booking
            </MobileLink>
            <MobileLink to="/pool-booking" onClick={toggleMenu}>
              Pool Booking
            </MobileLink>
            <MobileLink to="/event-booking" onClick={toggleMenu}>
              Event Booking
            </MobileLink>
            <MobileLink to="/about" onClick={toggleMenu}>
              About
            </MobileLink>
            <MobileLink to="/contact" onClick={toggleMenu}>
              Contact
            </MobileLink>
            {user?.role === 'admin' && (
              <MobileLink to="/admin" onClick={toggleMenu}>
                Dashboard
              </MobileLink>
            )}
            <div className="border-t pt-2 mt-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm">Welcome, {user.username}</div>
                  <MobileButton onClick={logout}>
                    Logout
                  </MobileButton>
                </>
              ) : (
                <>
                  <MobileLink to="/login" onClick={toggleMenu}>
                    Login
                  </MobileLink>
                  <MobileLink to="/signup" onClick={toggleMenu}>
                    Sign Up
                  </MobileLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Reusable component for desktop navigation links
const NavLink = ({ to, children, hoverStyle }) => (
  <Link
    to={to}
    className="px-3 py-2 rounded-md text-sm font-medium"
    style={{ 
      color: '#FFFFFF',
      ':hover': hoverStyle
    }}
  >
    {children}
  </Link>
);

// Reusable component for auth buttons
const AuthLink = ({ to, color, children }) => (
  <Link
    to={to}
    className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
    style={{
      backgroundColor: color,
      color: '#FFFFFF',
      ':hover': { backgroundColor: `${color}CC` }
    }}
  >
    {children}
  </Link>
);

// Reusable component for mobile links
const MobileLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-sm hover:bg-gray-700"
  >
    {children}
  </Link>
);

// Reusable component for mobile buttons
const MobileButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
  >
    {children}
  </button>
);

export default Navbar;