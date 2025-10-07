// src/components/layout/AppNavbar.tsx
import React from 'react';
import Link from 'next/link';
import { Target, Search, UserCircle2 } from 'lucide-react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, isActive }) => {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive
          ? 'text-green-600 font-semibold'
          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
        }
      `}
    >
      {children}
    </Link>
  );
};

const AppNavbar: React.FC = () => {
  // This would ideally come from routing information
  const activePage = "Goals";

  const navItems = [
    { name: "Home", href: "/" }, // Assuming home is at root
    { name: "Goals", href: "/goals" }, // Assuming goals list is at /goals
    { name: "Insights", href: "/insights" },
    { name: "Community", href: "/community" },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Constrain width and center */}
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Target className="w-7 h-7 text-green-600 group-hover:text-green-700 transition-colors" />
              <span className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">Leap AI</span>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
            {navItems.map((item) => (
              <NavLink key={item.name} href={item.href} isActive={item.name === activePage}>
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Right Side: Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              aria-label="Search"
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-gray-500 hover:text-gray-700"
            >
              <Search className="w-5 h-5" />
            </button>
            {/* User Avatar Placeholder */}
            <div
              className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center"
              title="User Avatar"
            >
              {/* <UserCircle2 className="w-8 h-8 text-gray-500" /> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
