import Link from "next/link";
import { getServerSession } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const session = await getServerSession();

  // Redirect authenticated users to their dashboard
  if (session?.user) {
    const role = session.user.role;
    if (role === 'homeowner') {
      redirect('/dashboard/homeowner');
    } else if (role === 'contractor') {
      redirect('/dashboard/contractor');
    } else if (role === 'admin') {
      redirect('/dashboard/admin');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HOMEase AI
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How It Works</a>
              <a href="#contractors" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">For Contractors</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200">
              <span className="text-sm font-medium">✨ AI-Powered Home Accessibility</span>
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Age in Place with
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Connect with vetted contractors to make your home safe, accessible, and comfortable. 
              Get AI-powered assessments and personalized recommendations in minutes.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="text-lg h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl">
                <Link href="/auth/signup?role=homeowner">
                  🏠 I&apos;m a Homeowner
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8 border-2 hover:border-blue-600 hover:text-blue-600">
                <Link href="/auth/signup?role=contractor">
                  👷 I&apos;m a Contractor
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified Contractors</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose HOMEase AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets compassionate care for your home accessibility needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI scans your home and identifies potential hazards with 95% accuracy, providing detailed recommendations instantly.
              </p>
            </Card>

            <Card className="group p-8 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vetted Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                Every contractor is background-checked, licensed, and specialized in aging-in-place modifications for your peace of mind.
              </p>
            </Card>

            <Card className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparent Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant quotes, compare options side-by-side, and never worry about hidden fees or surprise costs.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-12">
            {[
              {
                number: 1,
                icon: "📱",
                title: "AR Assessment",
                description: "Use your smartphone camera to scan your home. Our AI technology identifies accessibility issues, safety hazards, and provides instant visualization of improvements.",
                gradient: "from-blue-600 to-indigo-600"
              },
              {
                number: 2,
                icon: "🔍",
                title: "Get Matched",
                description: "Our algorithm instantly connects you with pre-vetted, licensed contractors who specialize in your specific needs and are available in your area.",
                gradient: "from-purple-600 to-pink-600"
              },
              {
                number: 3,
                icon: "🏡",
                title: "Complete Project",
                description: "Review quotes, communicate via secure chat, schedule work, and track progress all in one place. Leave a review when you're satisfied!",
                gradient: "from-green-600 to-emerald-600"
              }
            ].map((step, index) => (
              <div key={step.number} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 group`}>
                <div className={`flex-shrink-0 w-24 h-24 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl group-hover:scale-110 transition-transform`}>
                  {step.number}
                </div>
                <Card className="flex-1 p-8 hover:shadow-2xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{step.icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Contractors Section */}
      <section id="contractors" className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-blue-200 hover:bg-white/20">
              💼 Grow Your Business
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              For Contractors
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join our network of trusted accessibility professionals. Get qualified leads, 
              grow your business, and make a real difference in people&apos;s lives.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: "📈", title: "High-Intent Leads", description: "Customers ready to hire" },
                { icon: "⚡", title: "Instant Matching", description: "AI-powered connections" },
                { icon: "💳", title: "Secure Payments", description: "Fast, reliable transactions" }
              ].map((feature) => (
                <Card key={feature.title} className="bg-white/10 backdrop-blur-sm p-6 border-white/20 hover:bg-white/20 transition-colors">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <div className="text-2xl font-bold mb-2">{feature.title}</div>
                  <p className="text-blue-200">{feature.description}</p>
                </Card>
              ))}
            </div>

            <Button size="lg" asChild className="bg-white text-blue-900 hover:bg-gray-100 hover:scale-105 transition-all h-14 px-10 text-lg">
              <Link href="/auth/signup?role=contractor">
                Join as a Contractor
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-xl font-bold text-white">HOMEase AI</span>
              </div>
              <p className="text-sm">
                Making homes accessible and safe for aging in place with AI-powered solutions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 HOMEase AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
