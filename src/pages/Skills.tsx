import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import SkillCircle from '@/components/SkillCircle';
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                {skills.map((skill, index) => (
                  <SkillCircle key={skill.id} name={skill.name} percentage={skill.percentage} color={skill.color} delay={index * 0.05} />
                ))}
              </div>

              {categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mt-24 max-w-5xl mx-auto"
                >
                  <h2 className="text-2xl font-display font-bold text-center mb-12 gradient-text">Skill Categories</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    {categories.map((cat) => (
                      <div key={cat} className="glass-card p-6">
                        <h3 className="text-lg font-display font-semibold mb-4 text-primary">{cat}</h3>
                        <ul className="space-y-2 text-muted-foreground">
                          {skills.filter((s) => s.category === cat).map((s) => (
                            <li key={s.id}>• {s.name}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
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
