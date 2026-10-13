import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, Download, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SkillCircle from '@/components/SkillCircle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import profileImage from '@/assets/profile-themed.png';
import { useSkills } from '@/hooks/useSkills';

const Index = () => {
  const { skills: all } = useSkills();
  const featured = all.filter((s) => s.featured);
  const skills = (featured.length ? featured : all).slice(0, 4);
  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = '/Daniyal_Asif_CV.pdf';
    link.download = 'Daniyal_Asif_CV.pdf';
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Glow */}
        <div className="hero-glow animate-pulse-glow" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-xl opacity-50 animate-pulse" />
                <img
                  src={profileImage}
                  alt="Daniyal Asif"
                  className="relative w-full h-full rounded-full object-cover border-4 border-primary/30 shadow-2xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Frontend Developer
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold mb-6"
            >
              Hi, I'm{' '}
              <span className="gradient-text">Daniyal Asif</span>
              <span className="block text-2xl md:text-3xl font-medium text-muted-foreground mt-4">
                Frontend Developer — React &amp; Modern Web Apps
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Results-oriented Frontend Developer specializing in building responsive, 
              accessible, and user-centric web applications with React and modern frontend technologies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button variant="hero" onClick={handleDownloadCV}>
                <Download size={20} />
                Download CV
              </Button>
              <Button variant="heroOutline" asChild>
                <a href="https://github.com/DaniyalAsif7778" target="_blank" rel="noopener noreferrer">
                  <Github size={20} />
                  GitHub Profile
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center justify-center gap-6"
            >
              <a
                href="https://github.com/DaniyalAsif7778"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Daniyal Asif on GitHub"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={24} />
              </a>
              <a
                href="https://linkedin.com/in/DaniyalAsif7778"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Daniyal Asif on LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin size={24} />
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted-foreground"
          >
            <ArrowDown size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* Skills Preview Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="gradient-text">Core Skills</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Technologies I work with to build amazing web experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {skills.map((skill, index) => (
              <SkillCircle
                key={skill.id}
                name={skill.name}
                percentage={skill.percentage}
                color={skill.color}
                delay={index * 0.1}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" asChild>
              <Link to="/skills">View All Skills</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
