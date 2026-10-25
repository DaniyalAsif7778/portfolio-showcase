import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Mail, Phone, Target, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import profileImage from '@/assets/profile-themed.png';

const About = () => {
  const { settings, loading } = useSiteSettings();
  const a = settings.about;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader
            as="h1"
            title={a.heading}
            subtitle={a.subtitle}
          />

          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            {/* Left Column - Personal Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="glass-card p-8">
                {/* Profile Image */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-xl opacity-40 animate-pulse" />
                    <img
                      src={settings.profile_image || profileImage}
                      alt={settings.name}
                      className="relative w-full h-full rounded-full object-cover border-4 border-primary/30 shadow-2xl"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-6 gradient-text">
                  {a.whoTitle}
                </h3>
                {a.paragraphs.filter(Boolean).map((p, i) => (
                  <p
                    key={i}
                    className={`text-muted-foreground leading-relaxed ${i === a.paragraphs.filter(Boolean).length - 1 ? 'mb-8' : 'mb-6'}`}
                  >
                    {p}
                  </p>
                ))}

                <div className="space-y-4">
                  {a.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin size={20} className="text-primary" />
                      <span>{a.location}</span>
                    </div>
                  )}
                  {a.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail size={20} className="text-primary" />
                      <span>{a.email}</span>
                    </div>
                  )}
                  {a.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone size={20} className="text-primary" />
                      <span>{a.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Education & Goals */}
            <div className="space-y-8">
              {/* Education */}
              {a.education.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8"
                >
                  <h3 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3">
                    <GraduationCap className="text-primary" />
                    {a.educationTitle}
                  </h3>
                  <div className="space-y-6">
                    {a.education.map((e, i) => (
                      <div key={i} className={`border-l-2 ${i % 2 === 0 ? 'border-primary' : 'border-secondary'} pl-4`}>
                        <h4 className="font-semibold text-foreground">{e.title}</h4>
                        <p className="text-muted-foreground">{e.school}</p>
                        <p className="text-sm text-primary">{e.period}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Goals */}
              {a.goals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="glass-card p-8"
                >
                  <h3 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3">
                    <Target className="text-primary" />
                    {a.goalsTitle}
                  </h3>
                  <ul className="space-y-4 text-muted-foreground">
                    {a.goals.filter(Boolean).map((g, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Languages */}
              {a.languages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="glass-card p-8"
                >
                  <h3 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3">
                    <Heart className="text-primary" />
                    {a.languagesTitle}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {a.languages.filter(Boolean).map((l, i) => (
                      <span key={i} className="px-4 py-2 rounded-full bg-secondary text-foreground font-medium">
                        {l}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
