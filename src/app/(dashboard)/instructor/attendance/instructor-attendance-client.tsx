'use client';

import { useState } from 'react';
import { QRGeneratorModal } from '@/components/attendance/QRGeneratorModal';

interface InstructorAttendanceClientProps {
  children: React.ReactNode;
}

export function InstructorAttendanceClient({ children }: InstructorAttendanceClientProps) {
  const [activeCourse, setActiveCourse] = useState<{ id: string; title: string } | null>(null);

  // We'll intercept the children or just provide a way for the children to call this
  // But since the children are server components in a list, we can use a custom event or a shared context
  // Alternatively, we can just make the "Course Section" a client component too, but let's try a simpler approach
  
  return (
    <div className="instructor-attendance-provider">
        {/* Pass the setter via window event for simplicity in this hybrid setup or use a Context if we refactor more */}
        <div onClick={(e) => {
            const target = e.target as HTMLElement;
            const qrBtn = target.closest('[data-qr-course-id]');
            if (qrBtn) {
                const id = qrBtn.getAttribute('data-qr-course-id')!;
                const title = qrBtn.getAttribute('data-qr-course-title')!;
                setActiveCourse({ id, title });
            }
        }}>
            {children}
        </div>

        {activeCourse && (
            <QRGeneratorModal 
                courseId={activeCourse.id} 
                courseTitle={activeCourse.title} 
                onClose={() => setActiveCourse(null)} 
            />
        )}
    </div>
  );
}
