import { useEffect, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminCall } from '@/lib/adminApi';
import { useSiteSettings, AboutContent } from '@/hooks/useSiteSettings';

const AdminAbout = () => {
  const { settings, loading, reload } = useSiteSettings();
  const [form, setForm] = useState<AboutContent>(settings.about);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => setForm(settings.about), [settings.about]);

  const set = <K extends keyof AboutContent>(k: K) => (value: AboutContent[K]) =>
    setForm((f) => ({ ...f, [k]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCall({ action: 'settings_update', settings: { ...settings, about: form } });
      await reload();
      toast({ title: 'About page updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
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
    <form onSubmit={save} className="space-y-6">
      {/* Headings */}
      <div className="glass-card p-6 grid gap-5 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-lg font-semibold">Page headings</h2>
        <label className="space-y-1 text-sm">
          Main title
          <Input value={form.heading} onChange={(e) => set('heading')(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          Subtitle
          <Input value={form.subtitle} onChange={(e) => set('subtitle')(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          "Who I Am" card title
          <Input value={form.whoTitle} onChange={(e) => set('whoTitle')(e.target.value)} />
        </label>
      </div>

      {/* Paragraphs */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Your story</h2>
        {form.paragraphs.map((p, i) => (
          <div key={i} className="relative">
            <Textarea
              rows={3}
              placeholder={`Paragraph ${i + 1}`}
              value={p}
              onChange={(e) => {
                const next = [...form.paragraphs];
                next[i] = e.target.value;
                set('paragraphs')(next);
              }}
              className="pr-10"
            />
            <button
              type="button"
              aria-label="Remove paragraph"
              onClick={() => set('paragraphs')(form.paragraphs.filter((_, j) => j !== i))}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => set('paragraphs')([...form.paragraphs, ''])}
        >
          <Plus size={16} className="mr-2" /> Add paragraph
        </Button>
      </div>

      {/* Contact */}
      <div className="glass-card p-6 grid gap-5 sm:grid-cols-3">
        <h2 className="sm:col-span-3 text-lg font-semibold">Contact details</h2>
        <label className="space-y-1 text-sm">
          Location
          <Input value={form.location} onChange={(e) => set('location')(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          Email
          <Input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          Phone
          <Input value={form.phone} onChange={(e) => set('phone')(e.target.value)} />
        </label>
      </div>

      {/* Education */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Education</h2>
          <label className="text-sm space-y-1">
            <span className="sr-only">Education section title</span>
            <Input
              value={form.educationTitle}
              onChange={(e) => set('educationTitle')(e.target.value)}
              className="w-40"
              placeholder="Section title"
            />
          </label>
        </div>
        {form.education.map((e, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_180px_auto] items-end">
            <label className="space-y-1 text-sm">
              Degree
              <Input
                value={e.title}
                onChange={(ev) => {
                  const next = [...form.education];
                  next[i] = { ...next[i], title: ev.target.value };
                  set('education')(next);
                }}
              />
            </label>
            <label className="space-y-1 text-sm">
              School
              <Input
                value={e.school}
                onChange={(ev) => {
                  const next = [...form.education];
                  next[i] = { ...next[i], school: ev.target.value };
                  set('education')(next);
                }}
              />
            </label>
            <label className="space-y-1 text-sm">
              Dates
              <Input
                value={e.period}
                onChange={(ev) => {
                  const next = [...form.education];
                  next[i] = { ...next[i], period: ev.target.value };
                  set('education')(next);
                }}
              />
            </label>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              aria-label="Remove education entry"
              onClick={() => set('education')(form.education.filter((_, j) => j !== i))}
            >
              <X size={14} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => set('education')([...form.education, { title: '', school: '', period: '' }])}
        >
          <Plus size={16} className="mr-2" /> Add education entry
        </Button>
      </div>

      {/* Goals */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Goals</h2>
          <Input
            value={form.goalsTitle}
            onChange={(e) => set('goalsTitle')(e.target.value)}
            className="w-40"
            placeholder="Section title"
          />
        </div>
        {form.goals.map((g, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={g}
              placeholder={`Goal ${i + 1}`}
              onChange={(e) => {
                const next = [...form.goals];
                next[i] = e.target.value;
                set('goals')(next);
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              aria-label="Remove goal"
              onClick={() => set('goals')(form.goals.filter((_, j) => j !== i))}
            >
              <X size={14} />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => set('goals')([...form.goals, ''])}>
          <Plus size={16} className="mr-2" /> Add goal
        </Button>
      </div>

      {/* Languages */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Languages</h2>
          <Input
            value={form.languagesTitle}
            onChange={(e) => set('languagesTitle')(e.target.value)}
            className="w-40"
            placeholder="Section title"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {form.languages.map((l, i) => (
            <div key={i} className="flex items-center gap-1 rounded-full bg-secondary pl-3 pr-1">
              <Input
                value={l}
                onChange={(e) => {
                  const next = [...form.languages];
                  next[i] = e.target.value;
                  set('languages')(next);
                }}
                className="border-0 bg-transparent h-8 w-auto min-w-24 p-0 text-sm"
              />
              <button
                type="button"
                aria-label="Remove language"
                onClick={() => set('languages')(form.languages.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={() => set('languages')([...form.languages, ''])}>
          <Plus size={16} className="mr-2" /> Add language
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save About'}
      </Button>
    </form>
  );
};

export default AdminAbout;
