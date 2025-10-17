import Link from "next/link";
import { getServerSession } from "@/auth";
import { redirect } from "next/navigation";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            HOMEase AI
          </div>
          <div className="space-x-4">
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Age in Place with Confidence
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with vetted contractors to make your home safe, accessible, and comfortable. 
          Get AI-powered assessments and personalized recommendations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/auth/signup?role=homeowner" 
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            I'm a Homeowner
          </Link>
          <Link 
            href="/auth/signup?role=contractor" 
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50"
          >
            I'm a Contractor
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">1. AR Assessment</h3>
            <p className="text-gray-600">
              Use your phone to scan your home. Our AI identifies hazards and suggests modifications.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Get Matched</h3>
            <p className="text-gray-600">
              We connect you with pre-vetted contractors in your area who specialize in accessibility.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Complete Project</h3>
            <p className="text-gray-600">
              Review quotes, chat with contractors, and get your home modifications done right.
            </p>
          </div>
        </div>
      </section>

      {/* For Contractors Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">For Contractors</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our network of trusted accessibility professionals. 
              Get qualified leads and grow your aging-in-place business.
            </p>
            <Link 
              href="/auth/signup?role=contractor" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 inline-block"
            >
              Join as a Contractor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 HOMEase AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
