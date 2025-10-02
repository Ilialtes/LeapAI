"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Settings, LogOut, Target, Award } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { useAuth } from '@/context/AuthProvider';

const CommonHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Focus', icon: Home },
    { href: '/goals-overview', label: 'Goals', icon: Target },
    { href: '/trophy-room', label: 'Trophies', icon: Award },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LA</span>
              </div>
              <span className="text-xl font-bold" style={{color: '#2E7D32'}}>Leap AI</span>
            </Link>
          </div>

          {/* Navigation - Center */}
          <div className="flex-1 flex justify-center">
            {user ? (
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-50 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        color: isActive(item.href) ? '#1565C0' : '#546E7A'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.href)) {
                          e.currentTarget.style.color = '#2E7D32';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.href)) {
                          e.currentTarget.style.color = '#546E7A';
                        }
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    pathname === '/'
                      ? 'bg-blue-50 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    color: pathname === '/' ? '#1565C0' : '#546E7A'
                  }}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </nav>
            )}
          </div>

          {/* User Actions - Right */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="font-medium transition-colors px-3 py-2 hover:opacity-80"
                  style={{color: '#546E7A'}}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  style={{backgroundColor: '#2E7D32'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-2">
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CommonHeader;