'use client';

import React, { useState } from 'react';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { BrandingProvider } from '@/lib/branding-store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { NewProjectModal } from '@/components/modals/NewProjectModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <head>
        <title>FabricatorPro — Manufacturing Suite for uPVC Windows</title>
        <meta
          name="description"
          content="End-to-end uPVC fabrication SaaS suite with CAD SVG designer, 1D cut optimizer, and auto quotation."
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <BrandingProvider>
          <StoreProvider>
            <div className="flex min-h-screen overflow-x-hidden">
              {/* Left Sidebar */}
              <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onNewProjectClick={() => setIsNewProjectModalOpen(true)}
              />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <TopNav
                  isSidebarOpen={isSidebarOpen}
                  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
              </div>
            </div>

            {/* Universal + New Project Modal */}
            <NewProjectModal
              isOpen={isNewProjectModalOpen}
              onClose={() => setIsNewProjectModalOpen(false)}
            />
          </StoreProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
