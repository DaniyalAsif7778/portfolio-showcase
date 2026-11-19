import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const navItems = [
  { path: '/#top', label: 'Home', section: true },
  { path: '/#skills', label: 'Skills', section: true },
  { path: '/#projects', label: 'Projects', section: true },
  { path: '/#about', label: 'About', section: true },
  { path: '/profiles', label: 'Profiles', section: false },
  { path: '/#contact', label: 'Contact', section: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { settings } = useSiteSettings();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  useEffect(() => {
    let previousY = window.scrollY;
    let accumulatedDelta = 0;
    let direction = 0;
    let frame = 0;

    const updateHeader = () => {
      frame = 0;
      const currentY = window.scrollY;
      const delta = currentY - previousY;
      const nextDirection = Math.sign(delta);

      if (nextDirection === direction) accumulatedDelta += delta;
      else accumulatedDelta = delta;
      direction = nextDirection;
      previousY = currentY;

      if (currentY <= 64 || window.innerWidth >= 768) {
        setIsNavHidden(false);
        accumulatedDelta = 0;
        return;
      }
      if (isOpen) return;
      if (accumulatedDelta > 14) setIsNavHidden(true);
      if (accumulatedDelta < -14) setIsNavHidden(false);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setIsNavHidden(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleSectionLink = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    setIsOpen(false);
    if (location.pathname !== '/' || !path.startsWith('/#')) return;
    event.preventDefault();
    navigate(path);
    document.getElementById(path.split('#')[1])?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  return (
    <>
      <nav className={`site-nav sticky inset-x-0 top-0 z-50 hidden md:block${isNavHidden && !isOpen ? ' is-hidden' : ''}`} onFocusCapture={() => setIsNavHidden(false)}>
      <div className="container flex min-h-[76px] items-center justify-between">
        <Link to="/#top" aria-label={`${settings.name}, home`} onClick={(event) => handleSectionLink(event, '/#top')} className="flex items-center gap-3">
          <span className="site-mark">DA</span>
          <span><span className="block font-semibold leading-tight tracking-tight">{settings.name}</span><span className="eyebrow mt-1 block text-[9px]">{settings.badge}</span></span>
        </Link>
        <div className="flex items-center gap-7">
          {navItems.map((item) => item.section ? <Link key={item.path} to={item.path} onClick={(event) => handleSectionLink(event, item.path)} className="nav-link text-[13px] font-medium">{item.label}</Link> : <RouterNavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link text-[13px] font-medium ${isActive ? 'active' : ''}`}>{item.label}</RouterNavLink>)}
        </div>
        <button type="button" className="theme-toggle" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`} aria-pressed={isDark} title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      </nav>

      <nav className="mobile-nav-dock md:hidden" aria-label="Mobile navigation">
        <Link to="/#top" aria-label={`${settings.name}, home`} onClick={(event) => handleSectionLink(event, '/#top')} className="mobile-nav-identity">
          <img className="mobile-nav-avatar" src={settings.profile_image || '/daniyal-profile.png'} alt="" width="42" height="42" />
          <span className="mobile-nav-copy">
            <strong>{settings.name}</strong>
            <span>{settings.badge}</span>
          </span>
        </Link>
        <div className="mobile-nav-actions">
          <button type="button" className="theme-toggle" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`} aria-pressed={isDark} title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button type="button" aria-label="Open navigation menu" aria-expanded={isOpen} onClick={() => setIsOpen(true)} className="mobile-menu-toggle md:hidden">
            <Menu size={18} />
          </button>
        </div>
      </nav>

      <div className={`site-menu-layer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
        <button type="button" className="site-menu-backdrop" onClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1} aria-label="Dismiss navigation overlay" />
        <aside className="site-menu-sheet" role="dialog" aria-modal="true" aria-labelledby="site-menu-title">
          <div className="site-menu-wave" aria-hidden="true" />
          <div className="site-menu-content">
            <div className="site-menu-head">
              <p id="site-menu-title" className="eyebrow">Navigate</p>
              <button ref={closeButtonRef} type="button" className="site-menu-close" onClick={() => setIsOpen(false)} aria-label="Close navigation menu" aria-expanded={isOpen} tabIndex={isOpen ? 0 : -1}><X size={18} /></button>
            </div>
            <div className="site-menu-links">
              {navItems.map((item, index) => item.section ? (
                <Link key={item.path} to={item.path} onClick={(event) => handleSectionLink(event, item.path)} style={{ '--menu-delay': `${120 + index * 70}ms` } as CSSProperties} className="site-menu-link">{item.label}<span>↗</span></Link>
              ) : (
                <RouterNavLink key={item.path} to={item.path} onClick={() => setIsOpen(false)} style={{ '--menu-delay': `${120 + index * 70}ms` } as CSSProperties} className="site-menu-link">{item.label}<span>↗</span></RouterNavLink>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
