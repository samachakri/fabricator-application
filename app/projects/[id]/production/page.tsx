'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Factory, ArrowRight } from 'lucide-react';

export default function ProjectProductionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/production');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B64F2] flex items-center justify-center animate-pulse">
        <Factory className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">
          Loading Factory Production Workflow...
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Redirecting to the comprehensive Production Management module.
        </p>
      </div>
      <Link
        href="/production"
        className="px-4 py-2 bg-[#1B64F2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all"
      >
        <span>Go to Production Module</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
