import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const CafeinLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] overflow-hidden">
      {/* 1 Column: Sidebar */}
      <Sidebar />
      
      {/* 2 Column: Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
