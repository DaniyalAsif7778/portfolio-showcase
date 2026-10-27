import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const lastUpdated = 'October 2026';

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <section className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">1. Who this policy covers</h2>
            <p>
              This is the personal portfolio website of Daniyal Asif, a frontend developer based in Rawalpindi,
              Pakistan. This policy explains what information this website collects, why, and what happens to it.
              If you have questions, contact me at daniyal.asifjdk7778@gmail.com.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">2. Information the website collects</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Contact form:</strong> when you send a message through the contact
                page, the name, email, subject, message and any attachment you include are delivered to my email inbox
                through an email delivery service. This information is used only to reply to you.
              </li>
              <li>
                <strong className="text-foreground">Public content:</strong> projects, skills and images shown on this
                website are stored in a hosted database and are visible to everyone. They contain no personal data
                about visitors.
              </li>
              <li>
                <strong className="text-foreground">Visitor tracking:</strong> this website does not run advertising,
                does not sell data and does not use third-party advertising cookies.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">3. Attachments</h2>
            <p>
              Files you attach through the contact form are forwarded with your message. Please do not send sensitive
              documents (identity cards, financial records or similar) through the form.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">4. Cookies and local storage</h2>
            <p>
              This website does not set tracking cookies. Your browser may store small technical values needed for the
              site to function; these never leave your device and are not used to profile you.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">5. External links</h2>
            <p>
              This website links to my GitHub and LinkedIn profiles. Those sites have their own privacy policies and I
              am not responsible for how they handle your data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">6. Your choices</h2>
            <p>
              If you have emailed me and want your message or attachment deleted, send a request to
              daniyal.asifjdk7778@gmail.com and I will remove it.
            </p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Privacy;
