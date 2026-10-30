import { useEffect, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminCall, adminUpload } from '@/lib/adminApi';
import { useSiteSettings, SiteSettings } from '@/hooks/useSiteSettings';

const AdminHome = () => {
  const { settings, loading, reload, error } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'profile' | 'banner' | null>(null);
  const { toast } = useToast();

  useEffect(() => setForm(settings), [settings]);

  const set = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const upload = (field: 'profile_image' | 'linkedin_banner_url') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field === 'profile_image' ? 'profile' : 'banner');
    try {
      const url = await adminUpload(file);
      setForm((f) => ({ ...f, [field]: url }));
      toast({ title: 'Image uploaded', description: 'Save changes to publish it.' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not upload photo.', variant: 'destructive' });
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { name, badge, tagline, intro, github_url, linkedin_url, linkedin_banner_url, profile_image } = form;
      await adminCall({ action: 'settings_update', settings: { name, badge, tagline, intro, github_url, linkedin_url, linkedin_banner_url, profile_image } });
      await reload();
      toast({ title: 'Site profile saved', description: 'The homepage and profile page now use these values.' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not save homepage settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">Could not load saved profile content: {error}</div>;

  return (
    <form onSubmit={save} className="glass-card p-6 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 flex items-center gap-5">
        <div className="sm:col-span-2 grid gap-5 md:grid-cols-[1fr_1.6fr]">
          <div className="flex items-center gap-4 rounded-xl border border-border p-4">
            <img src={form.profile_image || '/daniyal-profile.png'} alt="Profile preview" className="h-20 w-20 rounded-full object-cover border border-border" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Portfolio portrait</p>
              <label className="inline-flex">
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={upload('profile_image')} disabled={uploading !== null} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-xs cursor-pointer hover:bg-secondary">
                  {uploading === 'profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={14} />} Choose portrait
                </span>
              </label>
              {form.profile_image && <button type="button" className="block text-xs text-muted-foreground underline" onClick={() => setForm({ ...form, profile_image: null })}>Use default portrait</button>}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={form.linkedin_banner_url || '/daniyal-linkedin-banner.jpg'} alt="LinkedIn banner preview" className="h-24 w-full object-cover" />
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="text-sm font-medium">LinkedIn profile banner</p>
              <label className="inline-flex">
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={upload('linkedin_banner_url')} disabled={uploading !== null} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-xs cursor-pointer hover:bg-secondary">
                  {uploading === 'banner' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={14} />} Change banner
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <label className="space-y-1 text-sm">
        Name *
        <Input value={form.name} onChange={set('name')} required />
      </label>
      <label className="space-y-1 text-sm">
        Badge (small label above name)
        <Input value={form.badge} onChange={set('badge')} />
      </label>
      <label className="space-y-1 text-sm sm:col-span-2">
        Tagline
        <Input value={form.tagline} onChange={set('tagline')} />
      </label>
      <label className="space-y-1 text-sm sm:col-span-2">
        Intro
        <Textarea rows={4} value={form.intro} onChange={set('intro')} />
      </label>
      <label className="space-y-1 text-sm">
        GitHub link
        <Input value={form.github_url} onChange={set('github_url')} />
      </label>
      <label className="space-y-1 text-sm">
        LinkedIn link
        <Input value={form.linkedin_url} onChange={set('linkedin_url')} />
      </label>
      <Button type="submit" className="sm:col-span-2" disabled={saving || uploading !== null}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Homepage'}
      </Button>
    </form>
  );
};

export default AdminHome;
