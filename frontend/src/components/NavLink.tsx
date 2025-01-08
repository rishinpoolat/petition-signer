import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, className = '' }) => {
  const location = useLocation();
  
  return (
    <Link
      to={to}
      className={className}
      onClick={(e) => {
        // Prevent navigation if we're already on the page
        if (location.pathname === to) {
          e.preventDefault();
          return;
        }
      }}
    >
      {children}
    </Link>
  );
};

export default NavLink;