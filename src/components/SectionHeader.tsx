import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  as?: 'h1' | 'h2';
}

const SectionHeader = ({ title, subtitle, as = 'h2' }: SectionHeaderProps) => {
  const Heading = as;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <Heading className="text-4xl md:text-5xl font-display font-bold mb-4">
        <span className="gradient-text">{title}</span>
      </Heading>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
