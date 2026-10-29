import { useState, type MouseEvent } from 'react';
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';

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
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const handleSectionLink = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    setIsOpen(false);
    if (location.pathname !== '/' || !path.startsWith('/#')) return;
    event.preventDefault();
    navigate(path);
    document.getElementById(path.split('#')[1])?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  return (
    <nav className="site-nav fixed inset-x-0 top-0 z-50">
      <div className="container flex min-h-[76px] items-center justify-between">
        <Link to="/#top" aria-label="Daniyal Asif, home" onClick={(event) => handleSectionLink(event, '/#top')} className="flex items-center gap-3">
          <span className="site-mark">DA</span>
          <span><span className="block font-semibold leading-tight tracking-tight">Daniyal Asif</span><span className="eyebrow mt-1 block text-[9px]">MERN stack developer</span></span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => item.section ? <Link key={item.path} to={item.path} onClick={(event) => handleSectionLink(event, item.path)} className="nav-link text-[13px] font-medium">{item.label}</Link> : <RouterNavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link text-[13px] font-medium ${isActive ? 'active' : ''}`}>{item.label}</RouterNavLink>)}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="theme-toggle" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`} aria-pressed={isDark} title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="menu-toggle md:hidden">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {isOpen && <div className="container border-t border-border pb-5 pt-3 md:hidden"><div className="grid grid-cols-2 gap-x-6 gap-y-1">{navItems.map((item) => item.section ? <Link key={item.path} to={item.path} onClick={(event) => handleSectionLink(event, item.path)} className="nav-link rounded py-3 text-sm font-medium">{item.label}</Link> : <RouterNavLink key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-link rounded py-3 text-sm font-medium ${isActive ? 'active' : ''}`}>{item.label}</RouterNavLink>)}</div></div>}
    </nav>
  );
};

export default Navbar;
