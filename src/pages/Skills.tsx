import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import SkillCircle from '@/components/SkillCircle';

const skills = [
  { name: 'React', percentage: 90, color: 'hsl(192 95% 68%)' },
  { name: 'Redux Toolkit', percentage: 85, color: 'hsl(261 78% 63%)' },
  { name: 'Tailwind CSS', percentage: 92, color: 'hsl(198 93% 60%)' },
  { name: 'TypeScript', percentage: 80, color: 'hsl(211 60% 48%)' },
  { name: 'Git & GitHub', percentage: 88, color: 'hsl(12 80% 55%)' },
  { name: 'JavaScript', percentage: 90, color: 'hsl(50 98% 64%)' },
  { name: 'HTML5', percentage: 95, color: 'hsl(14 100% 57%)' },
  { name: 'CSS3', percentage: 92, color: 'hsl(205 87% 50%)' },
  { name: 'GSAP', percentage: 70, color: 'hsl(142 76% 50%)' },
  { name: 'React Router', percentage: 88, color: 'hsl(200 80% 55%)' },
  { name: 'TanStack Router', percentage: 75, color: 'hsl(280 75% 55%)' },
  { name: 'Responsive Design', percentage: 93, color: 'hsl(174 72% 56%)' },
];

const Skills = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader
            as="h1"
            title="Skills"
            subtitle="Technologies and tools I use to bring ideas to life"
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {skills.map((skill, index) => (
              <SkillCircle
                key={skill.name}
                name={skill.name}
                percentage={skill.percentage}
                color={skill.color}
                delay={index * 0.05}
              />
            ))}
          </motion.div>

          {/* Skill Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-24 max-w-5xl mx-auto"
          >
            <h3 className="text-2xl font-display font-bold text-center mb-12 gradient-text">
              Skill Categories
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Frontend Development */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-display font-semibold mb-4 text-primary">
                  Frontend Development
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• React JS</li>
                  <li>• JavaScript (ES6+)</li>
                  <li>• HTML5 & CSS3</li>
                  <li>• Tailwind CSS</li>
                  <li>• Responsive Web Design</li>
                </ul>
              </div>

              {/* State & Routing */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-display font-semibold mb-4 text-primary">
                  State & Routing
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Redux Toolkit</li>
                  <li>• React Router</li>
                  <li>• TanStack Router</li>
                  <li>• Context API</li>
                </ul>
              </div>

              {/* Tools & Technologies */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-display font-semibold mb-4 text-primary">
                  Tools & Technologies
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• TypeScript</li>
                  <li>• Git & GitHub</li>
                  <li>• Vercel</li>
                  <li>• GSAP Animations</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Skills;
