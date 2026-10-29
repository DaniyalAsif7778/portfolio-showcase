import { useEffect, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminCall, adminUpload } from '@/lib/adminApi';
import { useSiteSettings, SiteSettings } from '@/hooks/useSiteSettings';

const AdminHome = () => {
  const { settings, loading } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => setForm(settings), [settings]);

  const set = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminUpload(file);
      setForm((f) => ({ ...f, profile_image: url }));
      toast({ title: 'Photo uploaded', description: 'Click Save to publish it.' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not upload photo.', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCall({ action: 'settings_update', settings: form });
      toast({ title: 'Homepage updated' });
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

  return (
    <form onSubmit={save} className="glass-card p-6 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 flex items-center gap-5">
        <img
          src={form.profile_image || '/daniyal-profile.png'}
          alt="Profile preview"
          className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Profile photo</p>
          <label className="inline-flex">
            <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} />
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm cursor-pointer hover:bg-secondary">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={16} />} Upload new photo
            </span>
          </label>
          {form.profile_image && (
            <button type="button" className="block text-xs text-muted-foreground underline" onClick={() => setForm({ ...form, profile_image: null })}>
              Use default photo
            </button>
          )}
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
      <Button type="submit" className="sm:col-span-2" disabled={saving || uploading}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Homepage'}
      </Button>
    </form>
  );
};

export default AdminHome;
