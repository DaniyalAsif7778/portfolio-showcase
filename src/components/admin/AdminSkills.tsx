import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { adminCall } from '@/lib/adminApi';

type Skill = {
  id: string;
  name: string;
  percentage: number;
  color: string;
  category: string;
  featured: boolean;
  sort_order: number;
};

const empty = { name: '', percentage: 80, color: 'hsl(174 72% 56%)', category: 'Frontend', featured: false, sort_order: 0 };

const AdminSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('skills').select('*').order('sort_order');
    if (error) toast({ title: 'Error', description: 'Could not load skills.', variant: 'destructive' });
    else setSkills((data || []) as Skill[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const startNew = (category = empty.category) => {
    setEditingId(null);
    setForm({ ...empty, category, sort_order: skills.length + 1 });
    setOpen(true);
  };

  const startEdit = (s: Skill) => {
    setEditingId(s.id);
    setForm({ name: s.name, percentage: s.percentage, color: s.color, category: s.category, featured: s.featured, sort_order: s.sort_order });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCall(editingId ? { action: 'skill_update', id: editingId, skill: form } : { action: 'skill_create', skill: form });
      toast({ title: editingId ? 'Skill updated' : 'Skill added' });
      setOpen(false);
      void load();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not save skill.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Skill) => {
    if (!confirm(`Delete skill "${s.name}"?`)) return;
    try {
      await adminCall({ action: 'skill_delete', id: s.id });
      toast({ title: 'Skill deleted' });
      void load();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not delete skill.', variant: 'destructive' });
    }
  };

  const skillGroups = Array.from(new Set(skills.map((skill) => skill.category || 'Other')));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{skills.length} skills</p>
        <Button onClick={() => startNew()}>
          <Plus size={18} className="mr-2" /> New Skill
        </Button>
      </div>

      {open && (
        <form onSubmit={save} className="glass-card p-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 flex justify-between items-center">
            <h2 className="font-display font-semibold">{editingId ? 'Edit Skill' : 'New Skill'}</h2>
            <Button type="button" size="icon" variant="ghost" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={16} />
            </Button>
          </div>
          <label className="space-y-1 text-sm">
            Name *
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="space-y-1 text-sm">
            Category
            <Input list="skill-category-options" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Frontend" />
            <datalist id="skill-category-options">{skillGroups.map((category) => <option value={category} key={category} />)}</datalist>
          </label>
          <label className="space-y-1 text-sm">
            Color (e.g. hsl(174 72% 56%) or #22d3ee)
            <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </label>
          <label className="space-y-1 text-sm">
            Display order
            <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </label>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Show on homepage
          </label>
          <Button type="submit" className="sm:col-span-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Save Changes' : 'Add Skill'}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        skills.length === 0 ? <div className="glass-card p-8 text-center"><p className="font-semibold">No skills added yet</p><p className="mt-2 text-sm text-muted-foreground">Create a skill and assign it to a category to build the homepage groups.</p></div> : (
          <div className="space-y-5">
            {skillGroups.map((category) => (
              <section key={category} className="glass-card space-y-3 p-4 sm:p-5" aria-label={`${category} skills`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div><h2 className="font-display text-lg font-semibold">{category}</h2><p className="text-xs text-muted-foreground">{skills.filter((skill) => (skill.category || 'Other') === category).length} skills in this group</p></div>
                  <Button size="sm" variant="outline" onClick={() => startNew(category)}><Plus size={15} className="mr-1" /> Add to category</Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {skills.filter((skill) => (skill.category || 'Other') === category).map((s) => (
                    <div key={s.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
                      <div className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                      <div className="min-w-0 flex-1"><p className="truncate font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">Order {s.sort_order}{s.featured ? ' · Homepage' : ''}</p></div>
                      <Button size="icon" variant="outline" aria-label={`Edit ${s.name}`} onClick={() => startEdit(s)}><Pencil size={16} /></Button>
                      <Button size="icon" variant="destructive" aria-label={`Delete ${s.name}`} onClick={() => remove(s)}><Trash2 size={16} /></Button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminSkills;
