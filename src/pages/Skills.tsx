import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import { useSkills } from '@/hooks/useSkills';

const Skills = () => {
  const { skills, loading } = useSkills();
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader as="h1" title="Skills" subtitle="Technologies and tools I use to bring ideas to life" />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {categories.length > 0 && (
                <div className="mt-8 max-w-5xl mx-auto">
                  <h2 className="text-2xl font-display font-bold text-center mb-8 gradient-text">Tools and experience</h2>
                  <div className="grid gap-5 md:grid-cols-2">
                    {categories.map((cat, index) => (
                      <article key={cat} className="glass-card p-6 md:p-7">
                        <p className="eyebrow mb-3">{String(index + 1).padStart(2, '0')} / SKILLS</p>
                        <h3 className="text-lg font-display font-semibold mb-5 text-foreground">{cat}</h3>
                        <ul className="flex flex-wrap gap-2.5">
                          {skills.filter((s) => s.category === cat).map((s) => (
                            <li key={s.id} className="rounded-full border px-3 py-2 text-sm text-foreground" style={{ borderColor: s.color }}>{s.name}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Skills;
