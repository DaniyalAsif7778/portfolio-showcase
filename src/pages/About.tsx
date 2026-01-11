import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Mail, Phone, Target, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader
            title="About Me"
            subtitle="Get to know me better"
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
                <h3 className="text-2xl font-display font-semibold mb-6 gradient-text">
                  Who I Am
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  I'm a results-oriented Frontend Developer from Rawalpindi, Pakistan, 
                  specializing in building responsive, accessible, and user-centric web 
                  applications with React and modern frontend technologies.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  With a proven ability to design and implement real-world projects with 
                  clean, maintainable code and strong problem-solving skills, I'm eager to 
                  leverage my React expertise to contribute to impactful user interfaces 
                  and accelerate professional growth.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin size={20} className="text-primary" />
                    <span>Rawalpindi, Punjab, Pakistan</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail size={20} className="text-primary" />
                    <span>daniyal.asifjdk7778@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone size={20} className="text-primary" />
                    <span>0312 1982877</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Education & Goals */}
            <div className="space-y-8">
              {/* Education */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <h3 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3">
                  <GraduationCap className="text-primary" />
                  Education
                </h3>
                <div className="space-y-6">
                  <div className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold text-foreground">Intermediate Computer Science (ICS)</h4>
                    <p className="text-muted-foreground">Superior College Pindsultani</p>
                    <p className="text-sm text-primary">Jan 2023 – Jan 2025</p>
                  </div>
                  <div className="border-l-2 border-secondary pl-4">
                    <h4 className="font-semibold text-foreground">Matric in Computer Science</h4>
                    <p className="text-muted-foreground">SPIRIT SCHOOL Basal</p>
                    <p className="text-sm text-primary">Jan 2021 – Jan 2023</p>
                  </div>
                </div>
              </motion.div>

              {/* Goals */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <h3 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3">
                  <Target className="text-primary" />
                  My Goals
                </h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Master advanced React patterns and state management
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Contribute to open-source projects and communities
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Build impactful web applications that solve real problems
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Grow as a full-stack developer over time
                  </li>
                </ul>
              </motion.div>

              {/* Languages */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <h3 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3">
                  <Heart className="text-primary" />
                  Languages
                </h3>
                <div className="flex gap-4">
                  <span className="px-4 py-2 rounded-full bg-secondary text-foreground font-medium">
                    Urdu (Native)
                  </span>
                  <span className="px-4 py-2 rounded-full bg-secondary text-foreground font-medium">
                    English (Fluent)
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
