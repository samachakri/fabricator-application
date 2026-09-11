'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function ProjectRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { getProject } = useStore();
  const project = getProject(projectId);

  useEffect(() => {
    if (project && project.windows && project.windows.length > 0) {
      router.replace(`/projects/${projectId}/design/${project.windows[0].id}`);
    } else if (projectId) {
      router.replace(`/projects/${projectId}/design/W01`);
    } else {
      router.replace('/design');
    }
  }, [project, projectId, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#0A2E8A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading Window Design Studio...</p>
      </div>
    </div>
  );
}
