import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const lastUpdated = 'October 2026';

const Terms = () => (
  <div className="min-h-screen bg-background">
    <SEO title="Terms and Conditions" description="Terms for using Daniyal Asif's portfolio website and viewing its project descriptions, images, code samples, and contact form." path="/terms" />
    <Navbar />
    <main className="pt-24 pb-16">
      <section className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold mb-3">Terms and Conditions</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">1. What this website is</h2>
            <p>
              This website presents the work, skills and contact details of Daniyal Asif, a MERN Stack Developer. By
              using this website you agree to these terms. If you do not agree, please stop using the site.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">2. Content ownership</h2>
            <p>
              Project descriptions, images, code samples and other content on this website belong to Daniyal Asif
              unless stated otherwise. You may view and share links to this website freely. You may not copy,
              republish or present this content as your own without written permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">3. Acceptable use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not attempt to access the admin area, break the site or interfere with its hosting.</li>
              <li>Do not use the contact form to send spam, unlawful or abusive content.</li>
              <li>Attachments sent through the contact form must not contain malware.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">4. Availability</h2>
            <p>
              This website is provided as is. I aim to keep it online and accurate, but I do not guarantee it will
              always be available, error free or up to date, and I may change or remove content at any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">5. Limitation of liability</h2>
            <p>
              To the extent permitted by law, I am not liable for any loss or damage arising from the use of this
              website or from reliance on the information shown on it.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">6. Contact</h2>
            <p>
              Questions about these terms can be sent to danyalasif.dev@gmail.com or through the contact page.
            </p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Terms;
