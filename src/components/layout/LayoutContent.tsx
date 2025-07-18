"use client";

import React from 'react';
import { useAuth } from "@/context/AuthProvider";
import { usePathname } from "next/navigation";
import CommonHeader from "@/components/layout/CommonHeader";

interface LayoutContentProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutContentProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/auth/signin' || pathname === '/auth/signup';
  const isHomePage = pathname === '/';
  
  // Always show header now, but it will conditionally show content based on auth state
  const showHeader = true;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {showHeader && <CommonHeader />}
      <div className="flex-1 bg-slate-50">
        {children}
      </div>
      <footer className="text-center text-xs text-gray-400 py-4 bg-slate-50">
        <p>© 2025 Leap AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LayoutContent;