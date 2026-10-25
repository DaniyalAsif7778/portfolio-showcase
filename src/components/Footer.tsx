import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="border-t border-border py-8"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href={settings.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href={settings.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href={settings.about.email ? `mailto:${settings.about.email}` : '#'}
              aria-label="Send email"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
