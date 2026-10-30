import { useState, FormEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Send, Mail, User, MessageSquare, Loader2, CheckCircle, AlertCircle, FileText, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import SEO from '@/components/SEO';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// EmailJS public configuration used by the contact form.
const EMAILJS_SERVICE_ID = 'service_4pjt1o8';
const EMAILJS_TEMPLATE_ID = 'template_j070jzr';
const EMAILJS_PUBLIC_KEY = 'd7-qXzSLUnT7xVTbY';

const Contact = () => {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setAttachmentError('File size should be less than 5MB.');
        return;
      }
      setAttachmentError(null);
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const templateParams: Record<string, string> = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject || 'No Subject',
        message: formData.message,
        to_name: settings.name,
      };

      // If there's an attachment, convert to base64
      if (attachment) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(attachment);
        });
        templateParams.attachment = base64;
        templateParams.attachment_name = attachment.name;
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setAttachment(null);
      setAttachmentError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Contact Daniyal Asif" description="Get in touch with Daniyal Asif about MERN stack development, frontend opportunities, collaborations, and web application projects." path="/contact" />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader
            title="Contact"
            subtitle="Let's work together on your next project"
          />

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                      placeholder="What's this about?"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 text-muted-foreground" size={20} />
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                </div>

                {/* Attachment Field */}
                <div>
                  <label
                    htmlFor="attachment"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Attachment <span className="text-muted-foreground">(optional, max 5MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="attachment"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-left"
                    >
                      <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <span className="text-muted-foreground">
                        {attachment ? '' : 'Choose a file...'}
                      </span>
                    </button>
                    {attachment && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20"
                      >
                        <Paperclip size={16} className="text-primary" />
                        <span className="text-sm text-foreground flex-1 truncate">{attachment.name}</span>
                        <button
                          type="button"
                          onClick={removeAttachment}
                          className="p-1 hover:bg-destructive/20 rounded-full transition-colors"
                        >
                          <X size={16} className="text-destructive" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                  {attachmentError && <p role="alert" className="mt-2 text-sm text-destructive">{attachmentError}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </Button>

                {/* Status Messages */}
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-500 justify-center"
                  >
                    <CheckCircle size={20} />
                    Message sent successfully!
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-destructive justify-center"
                  >
                    <AlertCircle size={20} />
                    Failed to send message. Please try again or email directly.
                  </motion.div>
                )}
              </form>

              {/* Alternative Contact */}
              <div className="mt-8 pt-8 border-t border-border text-center">
                <p className="text-muted-foreground mb-2">
                  Or reach me directly at:
                </p>
                <a
                  href={`mailto:${settings.about.email}`}
                  className="text-primary hover:underline font-medium"
                >
                  {settings.about.email}
                </a>
              </div>
            </motion.div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
