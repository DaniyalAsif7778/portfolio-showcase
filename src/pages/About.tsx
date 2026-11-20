import { useEffect, useRef } from 'react';
import { GraduationCap, MapPin, Mail, Phone, Target, Heart } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const About = () => {
  const { settings, loading } = useSiteSettings();
  const a = settings.about;
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        gsap.set('.about-reveal', { opacity: 1, y: 0 });
        return;
      }

      // Staggered reveal for all sections
      gsap.utils.toArray<HTMLElement>('.about-reveal').forEach((element, index) => {
        gsap.fromTo(element,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              once: true,
            },
            delay: index * 0.08,
          }
        );
      });

      // Parallax effect for profile image
      const profileImg = document.querySelector('.about-profile-img');
      if (profileImg) {
        gsap.to(profileImg, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: '.about-profile-img',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, pageRef);

    return () => context.revert();
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background" ref={pageRef}>
      <Navbar />

      <main className="pt-8 pb-16">
        <section className="w-full px-6 py-16">
                  <div className="max-w-6xl mx-auto">
                    <SectionHeader
                      as="h1"
                      title={a.heading}
                      subtitle={a.subtitle}
                      className="about-reveal"
                    />
                  </div>

                  <div className="grid lg:grid-cols-2 gap-16 items-start w-full max-w-none mx-auto px-6">
            {/* Left Column - Personal Info */}
            <div className="space-y-12 about-reveal">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="relative grid h-48 w-48 place-items-center rounded-full border border-[#c9d9d9] bg-[#e8f0f4] text-4xl font-semibold tracking-[-.08em] text-[var(--blue)] shadow-[10px_10px_0_#d7e3e9]">
                  <img
                    src={settings.profile_image || '/daniyal-profile.png'}
                    alt={settings.name}
                    className="about-profile-img absolute inset-0 h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-display font-semibold gradient-text">
                {a.whoTitle}
              </h3>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                {a.paragraphs.filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

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

            {/* Right Column - Education & Goals */}
            <div className="space-y-10">
              {/* Education */}
              {a.education.length > 0 && (
                <div className="about-reveal p-6 rounded-2xl border border-border bg-white/50 backdrop-blur-sm">
                  <h3 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3">
                    <GraduationCap className="text-primary" />
                    {a.educationTitle}
                  </h3>
                  <div className="space-y-6">
                    {a.education.map((e, i) => (
                      <div key={i} className={`border-l-2 ${i % 2 === 0 ? 'border-primary' : 'border-secondary'} pl-4`}>
                        <h4 className="font-semibold text-foreground">{e.title}</h4>
                        <p className="text-muted-foreground">{e.school}</p>
                        {e.period && <p className="text-sm text-primary">{e.period}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {a.goals.length > 0 && (
                <div className="about-reveal p-6 rounded-2xl border border-border bg-white/50 backdrop-blur-sm">
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
                </div>
              )}

              {/* Languages */}
              {a.languages.length > 0 && (
                <div className="about-reveal p-6 rounded-2xl border border-border bg-white/50 backdrop-blur-sm">
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
                </div>
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

