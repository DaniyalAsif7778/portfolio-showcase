import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, X, Loader2, Pencil, Trash2, ArrowLeft, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminCall, adminLogin, adminUpload, clearAdminToken, getAdminToken } from '@/lib/adminApi';
import AdminSkills from '@/components/admin/AdminSkills';
import AdminHome from '@/components/admin/AdminHome';
import AdminAbout from '@/components/admin/AdminAbout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailed_description: string | null;
  live_url: string | null;
  github_url: string | null;
  video_url: string | null;
  tech_stack: string[] | null;
  images: string[] | null;
  sort_order: number;
};

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  detailedDescription: '',
  liveUrl: '',
  githubUrl: '',
  videoUrl: '',
  techStack: [] as string[],
  existingImages: [] as string[],
  sortOrder: 0,
};

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(() => !!getAdminToken());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<'projects' | 'skills' | 'homepage' | 'about'>('projects');

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [videoColumnStatus, setVideoColumnStatus] = useState<'checking' | 'ready' | 'missing' | 'unavailable'>('checking');

  const [form, setForm] = useState({ ...emptyForm });
  const [techInput, setTechInput] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [otherImages, setOtherImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    setLoadingList(true);
    const [projectResult, videoColumnResult] = await Promise.all([
      supabase.from('projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('projects').select('video_url').limit(1),
    ]);
    const columnError = videoColumnResult.error;
    setVideoColumnStatus(!columnError
      ? 'ready'
      : columnError.code === '42703' || /video_url.*does not exist|column.*video_url/i.test(columnError.message)
        ? 'missing'
        : 'unavailable');
    const { data, error } = projectResult;
    if (error) toast({ title: 'Error', description: 'Could not load projects.', variant: 'destructive' });
    else setProjects((data || []) as Project[]);
    setLoadingList(false);
  }, [toast]);

  useEffect(() => {
    if (authenticated) void fetchProjects();
  }, [authenticated, fetchProjects]);

  const callAdmin = async (body: Record<string, unknown>) => {
    try {
      return await adminCall(body);
    } catch (err) {
      if (!getAdminToken()) setAuthenticated(false);
      throw err;
    }
  };

  const uploadImage = adminUpload;

  const logout = () => {
    clearAdminToken();
    setAuthenticated(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await adminLogin(username.trim(), password);
      setAuthenticated(true);
    } catch (err: unknown) {
      toast({ title: 'Access Denied', description: err instanceof Error ? err.message : 'Invalid credentials', variant: 'destructive' });
    } finally {
      setPassword('');
      setLoggingIn(false);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setTechInput('');
    setMainImage(null);
    setOtherImages([]);
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setView('form');
  };

  const openEdit = (p: Project) => {
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      detailedDescription: p.detailed_description || '',
      liveUrl: p.live_url || '',
      githubUrl: p.github_url || '',
      videoUrl: p.video_url || '',
      techStack: p.tech_stack || [],
      existingImages: p.images || [],
      sortOrder: p.sort_order ?? 0,
    });
    setEditingId(p.id);
    setMainImage(null);
    setOtherImages([]);
    setView('form');
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`Delete project "${p.title}"?`)) return;
    try {
      await callAdmin({ action: 'project_delete', id: p.id });
      toast({ title: 'Project deleted' });
      fetchProjects();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not delete project.', variant: 'destructive' });
    }
  };

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) {
      setForm({ ...form, techStack: [...form.techStack, t] });
      setTechInput('');
    }
  };

  const removeTech = (tech: string) =>
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tech) });

  const removeExistingImage = (url: string) =>
    setForm({ ...form, existingImages: form.existingImages.filter((u) => u !== url) });

  const moveImage = (index: number, dir: -1 | 1) => {
    const imgs = [...form.existingImages];
    const t = index + dir;
    if (t < 0 || t >= imgs.length) return;
    [imgs[index], imgs[t]] = [imgs[t], imgs[index]];
    setForm({ ...form, existingImages: imgs });
  };

  const makeMain = (index: number) => {
    const imgs = [...form.existingImages];
    const [img] = imgs.splice(index, 1);
    setForm({ ...form, existingImages: [img, ...imgs] });
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (videoColumnStatus === 'missing') {
      toast({
        title: 'Supabase database migration required',
        description: 'Apply supabase/migrations/20261029103000_add_project_video_url.sql in the Supabase SQL Editor, then refresh this page before saving project changes.',
        variant: 'destructive',
      });
      return;
    }
    if (!form.title || !form.description) {
      toast({ title: 'Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls: string[] = [...form.existingImages];

      if (mainImage) {
        const url = await uploadImage(mainImage);
        // When editing without prior images, treat this as first (main). Otherwise append.
        if (imageUrls.length === 0) imageUrls.push(url);
        else imageUrls.splice(0, 0, url);
      }

      for (const img of otherImages) {
        const url = await uploadImage(img);
        imageUrls.push(url);
      }

      const projectSlug = form.slug || generateSlug(form.title);
      const payload = {
        title: form.title,
        slug: projectSlug,
        description: form.description,
        detailed_description: form.detailedDescription || null,
        live_url: form.liveUrl || null,
        github_url: form.githubUrl || null,
        video_url: form.videoUrl || null,
        tech_stack: form.techStack,
        images: imageUrls,
        sort_order: Number(form.sortOrder) || 0,
      };

      if (editingId) {
        await callAdmin({ action: 'project_update', id: editingId, project: payload });
        toast({ title: 'Project updated successfully!' });
      } else {
        await callAdmin({ action: 'project_create', project: payload });
        toast({ title: 'Project added successfully!' });
      }

      resetForm();
      setView('list');
      fetchProjects();
    } catch (error: unknown) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Could not save project.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-display font-bold mb-6 text-center">
            <span className="gradient-text">Admin Access</span>
          </h2>
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <Input
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              autoComplete="current-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="default" className="w-full" disabled={loggingIn}>
              {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4 max-w-5xl flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold">
                <span className="gradient-text">Admin Panel</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {loadingList ? 'Loading…' : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tab === 'projects' && (
                <Button onClick={openNew}>
                  <Plus size={18} className="mr-2" /> New Project
                </Button>
              )}
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
          <div className="container mx-auto px-6 max-w-5xl flex gap-1">
            {(['projects', 'skills', 'homepage', 'about'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {tab === 'homepage' ? (
          <div className="container mx-auto px-6 py-10 max-w-5xl">
            <AdminHome />
          </div>
        ) : tab === 'about' ? (
          <div className="container mx-auto px-6 py-10 max-w-5xl">
            <AdminAbout />
          </div>
        ) : tab === 'skills' ? (
          <div className="container mx-auto px-6 py-10 max-w-5xl">
            <AdminSkills />
          </div>
        ) : (

        <div className="container mx-auto px-6 py-10 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {loadingList ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-muted-foreground mb-4">No projects yet.</p>
                <Button onClick={openNew}>
                  <Plus size={18} className="mr-2" /> Add your first project
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="glass-card p-4 flex gap-4 items-center transition-all hover:border-primary/40 hover:shadow-[var(--shadow-primary)]"
                  >
                    {p.images && p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        loading="lazy"
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-border/60"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-secondary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{p.title}</h3>
                      <p className="text-xs text-muted-foreground truncate mb-2">/{p.slug} · order {p.sort_order ?? 0}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="icon" variant="outline" onClick={() => openEdit(p)} aria-label="Edit project">
                        <Pencil size={16} />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(p)} aria-label="Delete project">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
        )}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              setView('list');
            }}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to projects
          </Button>
          <h1 className="text-3xl font-display font-bold mb-8">
            <span className="gradient-text">{editingId ? 'Edit Project' : 'Add New Project'}</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 md:p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project Name *</label>
              <Input
                placeholder="My Awesome Project"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: !editingId && !f.slug ? generateSlug(title) : f.slug,
                  }));
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URL Slug</label>
              <Input
                placeholder="my-awesome-project"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Display Order (lower shows first)</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Short Description *</label>
              <Textarea
                placeholder="Brief project overview..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Detailed Description</label>
              <Textarea
                placeholder="Full project details..."
                value={form.detailedDescription}
                onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
                rows={5}
              />
            </div>

            {form.existingImages.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current Images</label>
                <div className="flex flex-wrap gap-3">
                  {form.existingImages.map((url, i) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt={`Project image ${i + 1}`}
                        className={`w-24 h-24 rounded-md object-cover border-2 ${i === 0 ? 'border-primary' : 'border-transparent'}`}
                      />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">Main</span>
                      )}
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => removeExistingImage(url)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                      <div className="flex justify-between mt-1">
                        <button type="button" aria-label="Move left" onClick={() => moveImage(i, -1)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={i === 0}>
                          <ChevronLeft size={16} />
                        </button>
                        <button type="button" aria-label="Set as main image" onClick={() => makeMain(i)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={i === 0}>
                          <Star size={14} />
                        </button>
                        <button type="button" aria-label="Move right" onClick={() => moveImage(i, 1)} className="text-muted-foreground hover:text-primary disabled:opacity-30" disabled={i === form.existingImages.length - 1}>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {editingId ? 'Add Main Picture (optional)' : 'Main Picture'}
              </label>
              <div className="glass-card p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMainImage(e.target.files?.[0] || null)}
                  className="hidden"
                  id="main-image"
                />
                <label
                  htmlFor="main-image"
                  className="flex items-center gap-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Upload size={20} />
                  <span>{mainImage ? mainImage.name : 'Choose main image...'}</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Other Pictures</label>
              <div className="glass-card p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setOtherImages((prev) => [...prev, ...files]);
                  }}
                  className="hidden"
                  id="other-images"
                />
                <label
                  htmlFor="other-images"
                  className="flex items-center gap-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Upload size={20} />
                  <span>Add more images...</span>
                </label>
                {otherImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {otherImages.map((file, i) => (
                      <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex items-center gap-1">
                        {file.name}
                        <button type="button" onClick={() => setOtherImages(otherImages.filter((_, idx) => idx !== i))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Live Demo Link</label>
              <Input
                placeholder="https://myproject.vercel.app"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">GitHub Link</label>
              <Input
                placeholder="https://github.com/..."
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project video URL (optional)</label>
              <Input
                type="url"
                placeholder="YouTube link or direct MP4/WebM URL"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">YouTube links play on the project detail page. Direct MP4 or WebM links use scroll scrubbing. EmpoManager shows a public sample video until you add its own.</p>
              {videoColumnStatus === 'missing' && <p role="alert" className="text-sm font-medium text-destructive">This Supabase database is missing the video_url column. Project updates cannot be saved until the video URL migration is applied.</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tech Stack</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. React"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addTech}>
                  <Plus size={18} />
                </Button>
              </div>
              {form.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-sm rounded-full bg-secondary text-primary flex items-center gap-1"
                    >
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" variant="default" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingId ? 'Saving...' : 'Adding Project...'}
                </>
              ) : editingId ? (
                'Save Changes'
              ) : (
                'Add Project'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
