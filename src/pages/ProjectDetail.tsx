import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ArrowLeft, ExternalLink, Github, Send, Trash2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  detailed_description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  images: string[];
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  user_id: string;
  created_at: string;
}

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (slug) fetchProject();
  }, [slug]);

  useEffect(() => {
    if (project) {
      fetchLikes();
      fetchComments();
    }
  }, [project, userId]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug!)
      .single();
    if (error || !data) {
      setLoading(false);
      return;
    }
    setProject(data as Project);
    setLoading(false);
  };

  const fetchLikes = async () => {
    if (!project) return;
    const { count } = await supabase
      .from('project_likes')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id);
    setLikesCount(count ?? 0);

    if (userId) {
      const { data } = await supabase
        .from('project_likes')
        .select('id')
        .eq('project_id', project.id)
        .eq('user_id', userId)
        .maybeSingle();
      setHasLiked(!!data);
    }
  };

  const fetchComments = async () => {
    if (!project) return;
    const { data } = await supabase
      .from('project_comments')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });
    setComments((data as Comment[]) ?? []);
  };

  const handleLike = async () => {
    if (!userId) {
      navigate('/auth');
      return;
    }
    if (!project) return;

    if (hasLiked) {
      await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', project.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('project_likes')
        .insert({ project_id: project.id, user_id: userId });
    }
    fetchLikes();
  };

  const handleComment = async () => {
    if (!userId) {
      navigate('/auth');
      return;
    }
    if (!project || !commentText.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    const name = userData.user?.user_metadata?.display_name || 'Anonymous';

    await supabase
      .from('project_comments')
      .insert({
        project_id: project.id,
        user_id: userId,
        content: commentText.trim(),
        author_name: name,
      });
    setCommentText('');
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from('project_comments').delete().eq('id', commentId);
    fetchComments();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-6">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-6 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Project not found</h2>
          <Link to="/projects" className="text-primary hover:underline">
            ← Back to projects
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Projects
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="gradient-text">{project.title}</span>
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-secondary text-primary"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github size={20} /> GitHub
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink size={20} /> Live Demo
                </a>
              )}
            </div>
          </motion.div>

          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="glass-card overflow-hidden rounded-xl mb-4">
              <img
                src={project.images[selectedImage] || '/placeholder.svg'}
                alt={`${project.title} screenshot ${selectedImage + 1}`}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {project.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-primary' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-display font-semibold mb-4">About this Project</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {project.detailed_description || project.description}
            </p>
          </motion.div>

          {/* Like & Comment Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-6 mb-8"
          >
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart size={24} fill={hasLiked ? 'currentColor' : 'none'} />
              <span className="font-medium">{likesCount}</span>
            </button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle size={24} />
              <span className="font-medium">{comments.length}</span>
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-display font-semibold mb-6">Comments</h2>

            {/* Add Comment */}
            <div className="flex gap-3 mb-8">
              <Textarea
                placeholder={userId ? 'Write a comment...' : 'Sign in to comment'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-secondary/50 border-border"
              />
              <Button
                onClick={handleComment}
                variant="default"
                size="icon"
                className="self-end"
                disabled={!commentText.trim()}
              >
                <Send size={18} />
              </Button>
            </div>

            {/* Comment List */}
            <div className="space-y-4">
              {comments.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="bg-secondary/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{comment.author_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      {userId === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
