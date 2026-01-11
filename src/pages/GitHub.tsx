import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, GitBranch, Star, Users, Calendar, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGitHubData } from '@/store/githubSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';

const GITHUB_USERNAME = 'DaniyalAsif7778';

const GitHub = () => {
  const dispatch = useAppDispatch();
  const { profile, repos, loading, error } = useAppSelector((state) => state.github);

  useEffect(() => {
    dispatch(fetchGitHubData(GITHUB_USERNAME));
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader
            title="GitHub"
            subtitle="My GitHub profile and recent repositories"
          />

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => dispatch(fetchGitHubData(GITHUB_USERNAME))}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {profile && !loading && (
            <div className="max-w-5xl mx-auto">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-8 mb-12"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || profile.login}
                    className="w-32 h-32 rounded-full border-4 border-primary/30"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-display font-bold mb-2">
                      {profile.name || profile.login}
                    </h2>
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        {profile.followers} followers
                      </span>
                      <span className="flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        {profile.following} following
                      </span>
                      <span className="flex items-center gap-2">
                        <GitBranch size={16} className="text-primary" />
                        {profile.public_repos} repos
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        Joined {formatDate(profile.created_at)}
                      </span>
                    </div>

                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      View GitHub Profile <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Repositories */}
              <h3 className="text-2xl font-display font-bold mb-8 text-center gradient-text">
                Recent Repositories
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {repos.map((repo, index) => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card p-6 hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                        {repo.name}
                      </h4>
                      <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {repo.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-primary" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star size={14} />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch size={14} />
                        {repo.forks_count}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GitHub;
