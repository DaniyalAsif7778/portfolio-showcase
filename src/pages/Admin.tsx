import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [otherImages, setOtherImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'Admin' && password === 'Admin') {
      setAuthenticated(true);
    } else {
      toast({ title: 'Access Denied', description: 'Invalid credentials', variant: 'destructive' });
    }
  };

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('project-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('project-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast({ title: 'Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls: string[] = [];

      if (mainImage) {
        const url = await uploadImage(mainImage);
        imageUrls.push(url);
      }

      for (const img of otherImages) {
        const url = await uploadImage(img);
        imageUrls.push(url);
      }

      const projectSlug = slug || generateSlug(title);

      const { error } = await supabase.from('projects').insert({
        title,
        slug: projectSlug,
        description,
        detailed_description: detailedDescription || null,
        live_url: liveUrl || null,
        github_url: githubUrl || null,
        tech_stack: techStack,
        images: imageUrls,
      } as any);

      if (error) throw error;

      toast({ title: 'Project added successfully!' });
      
      setTitle('');
      setSlug('');
      setDescription('');
      setDetailedDescription('');
      setLiveUrl('');
      setGithubUrl('');
      setTechStack([]);
      setMainImage(null);
      setOtherImages([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="default" className="w-full">
              Login
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8">
            <span className="gradient-text">Add New Project</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project Name *</label>
              <Input
                placeholder="My Awesome Project"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) setSlug(generateSlug(e.target.value));
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URL Slug</label>
              <Input
                placeholder="my-awesome-project"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Short Description *</label>
              <Textarea
                placeholder="Brief project overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Detailed Description</label>
              <Textarea
                placeholder="Full project details..."
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Main Picture</label>
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
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">GitHub Link</label>
              <Input
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
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
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech) => (
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
                  Adding Project...
                </>
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
