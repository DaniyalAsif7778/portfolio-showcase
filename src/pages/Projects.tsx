import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import ProjectCard from '@/components/ProjectCard';

const projects = [
 
  {
    title: 'Employee Management System',
    description: 'Developed the frontend for an employee management system focused on managing employee records, including adding, viewing, and organizing data. Emphasized a clean user interface, robust component structure, and basic state management.',
    techStack: ['React', 'JavaScript', 'CSS', 'State Management'],
    githubUrl: 'https://github.com/DaniyalAsif7778',
    liveUrl :"https://empoly-manegment-system.vercel.app/",
  },
  {
    title: 'E-Commerce Frontend',
    description: 'Brought to life a frontend e-commerce application featuring Home, Product Details, Cart, and Checkout pages. Integrated with the Fake Store API to dynamically fetch and display product data.',
    techStack: ['React', 'Tailwind CSS', 'Fake Store API', 'React Router'],
    githubUrl: 'https://github.com/DaniyalAsif7778',
  },
  {
    title: 'Weather App',
    description: 'Created a responsive weather application displaying real-time weather data by integrating a public weather API. Enhanced skills in API integration and handling asynchronous data fetching and user input.',
    techStack: ['React', 'Weather API', 'CSS', 'Async/Await'],
    githubUrl: 'https://github.com/DaniyalAsif7778',
  },
];

const Projects = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader
            title="Projects"
            subtitle="A selection of projects I've worked on"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.title}
                {...project}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-4">
              Want to see more of my work?
            </p>
            <a
              href="https://github.com/DaniyalAsif7778"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              View all projects on GitHub →
            </a>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;
