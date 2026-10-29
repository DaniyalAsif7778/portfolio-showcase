import { useEffect } from 'react';
import { ArrowUpRight, GitBranch, Github, Linkedin, Loader2, MapPin, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGitHubData } from '@/store/githubSlice';
import { linkedinProfileUrl } from '@/hooks/useSiteSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GITHUB_USERNAME = 'DaniyalAsif7778';

const Profiles = () => {
  const dispatch = useAppDispatch();
  const { profile, repos, loading, error } = useAppSelector((state) => state.github);

  useEffect(() => {
    dispatch(fetchGitHubData(GITHUB_USERNAME));
  }, [dispatch]);

  return (
    <div className="profile-page min-h-screen bg-background">
      <Navbar />
      <main className="container profile-main">
        <header className="profile-page-heading">
          <p className="eyebrow">Beyond the portfolio / 05</p>
          <h1>Find me<br /><em>out there.</em></h1>
          <p>Live work, open-source projects, and a place to connect.</p>
        </header>

        <section className="profile-platform-grid" aria-label="Social profiles">
          <article className="social-profile-card linkedin-profile-card">
            <a className="profile-banner" href={linkedinProfileUrl} target="_blank" rel="noreferrer" aria-label="Open LinkedIn profile">
              <img src="/daniyal-linkedin-banner.jpg" alt="MERN Stack Developer building full stack web applications" width="800" height="200" />
              <span className="profile-banner-cta">LinkedIn <ArrowUpRight size={17} /></span>
            </a>
            <div className="social-profile-content">
              <img className="linkedin-profile-photo" src="/daniyal-profile.png" alt="Portrait of Daniyal Asif" width="800" height="800" />
              <p className="eyebrow">Professional profile</p>
              <h2>Daniyal Asif</h2>
              <p className="social-profile-bio">MERN Stack Developer building full stack web applications.</p>
              <p className="social-profile-location"><MapPin size={15} /> Rawalpindi, Pakistan</p>
              <a className="profile-platform-link" href={linkedinProfileUrl} target="_blank" rel="noreferrer">Visit LinkedIn <ArrowUpRight size={16} /></a>
            </div>
          </article>

          <article className="social-profile-card github-profile-card">
            <div className="github-card-top"><span className="github-mark"><Github size={24} /></span><span className="eyebrow">Code & collaboration</span></div>
            {loading && <div className="profile-loading"><Loader2 className="animate-spin" size={22} /><span>Loading GitHub profile…</span></div>}
            {error && <div className="profile-error"><p>{error}</p><button type="button" onClick={() => dispatch(fetchGitHubData(GITHUB_USERNAME))}>Try again</button></div>}
            {profile && !loading && <>
              <div className="github-profile-intro">
                <img src={profile.avatar_url} alt={profile.name || profile.login} width="96" height="96" loading="lazy" />
                <div><p className="eyebrow">@{profile.login}</p><h2>{profile.name || profile.login}</h2></div>
              </div>
              <p className="social-profile-bio">{profile.bio || 'MERN Stack Developer sharing projects and experiments.'}</p>
              <div className="github-stats"><span><GitBranch size={15} />{profile.public_repos} repositories</span><span><Star size={15} />{profile.followers} followers</span></div>
              <a className="profile-platform-link" href={profile.html_url} target="_blank" rel="noreferrer">Visit GitHub <ArrowUpRight size={16} /></a>
            </>}
          </article>
        </section>

        {profile && !loading && <section className="profile-repositories" aria-labelledby="repositories-title">
          <div className="profile-repo-heading"><div><p className="eyebrow">Fresh from GitHub</p><h2 id="repositories-title">Recently updated</h2></div><a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noreferrer">All repositories <ArrowUpRight size={15} /></a></div>
          <div className="profile-repo-grid">
            {repos.slice(0, 4).map((repo, index) => <a className={`profile-repo-card profile-repo-${index % 4}`} key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer">
              <span className="repo-index">0{index + 1} / REPOSITORY</span><h3>{repo.name}</h3><p>{repo.description || 'Explore the code and project details on GitHub.'}</p>
              <div className="repo-meta">{repo.language && <span>{repo.language}</span>}<span><Star size={14} />{repo.stargazers_count}</span><span><GitBranch size={14} />{repo.forks_count}</span></div><ArrowUpRight className="repo-arrow" size={18} />
            </a>)}
          </div>
        </section>}
      </main>
      <Footer />
    </div>
  );
};

export default Profiles;
