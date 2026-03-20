import Link from "next/link";
import {
  HiOutlineViewGrid,
  HiOutlineBell,
  HiOutlineCreditCard,
  HiOutlineChartBar,
} from "react-icons/hi";

export default function Home() {
  return (
    <main className="bg-bg-primary text-text-primary min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-bg-sidebar/80 border-b border-border-default">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-lg text-white shadow-lg">
              P
            </div>
            <span className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition">
              Parasdeep
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-text-secondary hover:text-accent-primary transition font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-text-secondary hover:text-accent-primary transition font-medium">
              Pricing
            </Link>
            <Link href="#faq" className="text-text-secondary hover:text-accent-primary transition font-medium">
              FAQs
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block text-text-primary hover:text-accent-primary transition font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0">
          <div className="absolute top-40 right-1/3 w-96 h-96 bg-accent-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/30 rounded-full">
              <span className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></span>
              <p className="text-sm font-medium text-accent-primary">
                ✨ Manage your society effortlessly
              </p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-center">
            Society Management
            <span className="block bg-linear-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-text-secondary text-center max-w-3xl mx-auto mb-12">
            Track payments, manage residents, send notifications, and get real-time insights. Everything you need to run your society efficiently—in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="px-8 py-4 rounded-lg bg-linear-to-r from-accent-primary to-accent-secondary text-white font-bold text-center hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Start Free Trial →
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-lg border border-border-default text-text-primary font-bold text-center hover:bg-bg-glass transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Setup in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border-default">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <SimpleStat number="500+" label="Societies" />
          <SimpleStat number="25K+" label="Happy residents" />
          <SimpleStat number="₹50M+" label="Payments managed" />
          <SimpleStat number="99.9%" label="Uptime" />
        </div>
      </section>

      {/* Features - Minimalist */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-text-primary">
              Everything you need
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Simple tools designed for busy society managers to save time and reduce manual work.
            </p>
          </div>

          {/* Features Grid - Minimalist */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<HiOutlineViewGrid className="w-8 h-8" />}
              title="Smart Dashboard"
              desc="Overview of payments, residents, and important metrics at a glance"
            />

            <FeatureCard
              icon={<HiOutlineCreditCard className="w-8 h-8" />}
              title="Payment Tracking"
              desc="Automatically track who paid, who didn't, and send reminders instantly"
            />

            <FeatureCard
              icon={<HiOutlineBell className="w-8 h-8" />}
              title="Instant Alerts"
              desc="Notify residents about payments, announcements, and updates in real-time"
            />

            <FeatureCard
              icon={<HiOutlineChartBar className="w-8 h-8" />}
              title="Financial Reports"
              desc="Detailed insights on collections, expenses, and society finances"
            />
          </div>
        </div>
      </section>

      {/* How It Works - Minimalist */}
      <section className="py-24 lg:py-32 bg-bg-sidebar/40 border-y border-border-default">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">How it works</h2>

          <div className="space-y-8">
            <StepCard
              step="1"
              title="Add your flats and residents"
              desc="Input property information and resident contact details. Takes 5 minutes."
            />
            <StepCard
              step="2"
              title="Set payment amounts"
              desc="Define subscription plans for different flat types and maintenance fees."
            />
            <StepCard
              step="3"
              title="Send notifications"
              desc="Automatically send payment reminders via SMS and email to residents."
            />
            <StepCard
              step="4"
              title="Track and report"
              desc="Monitor collections and access detailed financial reports anytime."
            />
          </div>
        </div>
      </section>

      {/* Pricing - Clean */}
      <section id="pricing" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Simple pricing</h2>
            <p className="text-lg text-text-secondary">Choose the plan that works for your society</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="rounded-xl p-8 border border-border-default bg-bg-card hover:border-accent-primary/50 transition">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-text-muted text-sm mb-6">Small societies (up to 50 units)</p>
              <div className="mb-8">
                <span className="text-4xl font-bold">₹399</span>
                <span className="text-text-muted">/month</span>
              </div>
              <button className="w-full px-6 py-3 rounded-lg border border-border-default text-text-primary font-bold hover:bg-bg-glass transition mb-8">
                Get Started
              </button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Up to 50 units
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Payment tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Email notifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Basic reports
                </li>
              </ul>
            </div>

            {/* Professional - Highlighted */}
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-1.5 rounded-full text-xs font-bold text-white">
                  MOST POPULAR
                </span>
              </div>
              <div className="rounded-xl p-8 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border-2 border-accent-primary shadow-xl">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-text-muted text-sm mb-6">Growing societies (50-500 units)</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold">₹899</span>
                  <span className="text-text-muted">/month</span>
                </div>
                <Link
                  href="/login"
                  className="w-full block text-center px-6 py-3 rounded-lg bg-linear-to-r from-accent-primary to-accent-secondary text-white font-bold hover:shadow-lg transition mb-8"
                >
                  Start Free Trial
                </Link>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> Up to 500 units
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> SMS + Email alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> Advanced reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> API access
                  </li>
                </ul>
              </div>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl p-8 border border-border-default bg-bg-card hover:border-accent-primary/50 transition">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-text-muted text-sm mb-6">Large communities (500+ units)</p>
              <div className="mb-8">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <button className="w-full px-6 py-3 rounded-lg border border-border-default text-text-primary font-bold hover:bg-bg-glass transition mb-8">
                Contact Sales
              </button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Unlimited units
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Custom features
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Dedicated support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span> SLA guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Minimalist */}
      <section id="faq" className="py-24 lg:py-32 bg-bg-sidebar/40 border-y border-border-default">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently asked questions</h2>

          <div className="space-y-6">
            <FAQItem
              question="How long does setup take?"
              answer="Most societies are up and running within 10-15 minutes. We provide step-by-step guidance and our support team is always available to help."
            />
            <FAQItem
              question="Can I import existing resident data?"
              answer="Yes! You can upload a CSV file with all your resident information, and we'll handle the import for you."
            />
            <FAQItem
              question="Do you offer support?"
              answer="Absolutely. Professional and Enterprise plans include priority email support and phone support."
            />
            <FAQItem
              question="Can residents pay online?"
              answer="Yes, residents can view their dues and payment history in their personal portal. Online payment options are available with Professional plan and above."
            />
            <FAQItem
              question="Is my data secure?"
              answer="We use enterprise-grade encryption and comply with all data protection regulations. Your data is backed up daily and stored securely."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 border-t border-border-default relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5"></div>

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to simplify society management?
          </h2>
          <p className="text-lg text-text-secondary mb-12">
            Join hundreds of societies already running efficiently with Parasdeep.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Start Your Free Trial →
            </Link>
            <Link
              href="#pricing"
              className="px-8 py-4 rounded-lg border border-border-default text-text-primary font-bold hover:bg-bg-glass transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white">
                  P
                </div>
                <span className="font-bold">Parasdeep</span>
              </div>
              <p className="text-text-muted text-sm">
                Making society management effortless for everyone.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-text-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><Link href="#features" className="hover:text-accent-primary transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-accent-primary transition">Pricing</Link></li>
                <li><a href="#" className="hover:text-accent-primary transition">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="#" className="hover:text-accent-primary transition">About</a></li>
                <li><a href="#" className="hover:text-accent-primary transition">Blog</a></li>
                <li><a href="#" className="hover:text-accent-primary transition">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="#" className="hover:text-accent-primary transition">Privacy</a></li>
                <li><a href="#" className="hover:text-accent-primary transition">Terms</a></li>
                <li><a href="#" className="hover:text-accent-primary transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border-default pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-text-muted">
            <p>© {new Date().getFullYear()} Parasdeep. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-accent-primary transition">Twitter</a>
              <a href="#" className="hover:text-accent-primary transition">LinkedIn</a>
              <a href="#" className="hover:text-accent-primary transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Minimalist Components */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border-default bg-bg-card hover:border-accent-primary/50 transition group">
      <div className="text-accent-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2 text-text-primary">{title}</h3>
      <p className="text-text-muted text-sm">{desc}</p>
    </div>
  );
}

function SimpleStat({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
        {number}
      </p>
      <p className="text-text-muted font-medium">{label}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-lg">
        {step}
      </div>
      <div>
        <h3 className="font-bold text-xl text-text-primary mb-2">{title}</h3>
        <p className="text-text-muted">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border-default bg-bg-card hover:border-accent-primary/50 transition">
      <h3 className="font-bold text-text-primary mb-2">{question}</h3>
      <p className="text-text-muted text-sm">{answer}</p>
    </div>
  );
}