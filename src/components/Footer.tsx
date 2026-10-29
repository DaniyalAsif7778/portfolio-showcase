import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { linkedinProfileUrl, useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} {settings.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm mt-1">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms and Conditions
              </Link>
            </div>
          </div>

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
              href={linkedinProfileUrl}
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
    </footer>
  );
};

export default Footer;
