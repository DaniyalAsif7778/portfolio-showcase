type ProjectSummary = {
  slug: string;
  title: string;
  description: string;
  tech_stack?: string[] | null;
  github_url?: string | null;
  live_url?: string | null;
  detailed_description?: string | null;
  video_url?: string | null;
};

const empomanagerContent = {
  title: 'EmpoManager',
  description: 'A full stack MERN employee management platform with role based dashboards, secure sign in, task management, and leave tracking.',
  detailed_description: 'EmpoManager is a full stack MERN employee management system. Its React and TypeScript frontend uses Redux Toolkit, Tailwind CSS, and React Router. A Node.js and Express API connects the application to MongoDB. The platform includes role based dashboards, secure authentication, employee records, task management, leave tracking, and team visibility.',
  tech_stack: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS'],
  github_url: 'https://github.com/DaniyalAsif7778/employee-managment-system',
  live_url: 'https://employ-managment-system.vercel.app',
};

const sampleProjectVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

/** Keeps the portfolio's existing EMS entry accurate until its Supabase migration is applied. */
export const withCurrentProjectContent = <T extends ProjectSummary>(project: T): T => {
  const needsFullStackCorrection =
    project.slug === 'employee-management-system' &&
    (/developed the frontend for an employee management system/i.test(project.description) ||
      project.tech_stack?.includes('State Management') ||
      project.live_url === 'https://empoly-manegment-system.vercel.app');

  const currentProject = needsFullStackCorrection ? { ...project, ...empomanagerContent } : project;

  // Use a public sample clip for local playback testing until this project has its own recording.
  if (currentProject.slug === 'employee-management-system' && !currentProject.video_url) {
    return { ...currentProject, video_url: sampleProjectVideoUrl } as T;
  }

  return currentProject;
};
