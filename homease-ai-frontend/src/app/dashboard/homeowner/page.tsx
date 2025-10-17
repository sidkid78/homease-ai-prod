import { getServerSession } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomeownerDashboard() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'homeowner' && session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              HOMEase AI
            </Link>
            <span className="text-sm text-gray-600">Homeowner Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {session.user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name || session.user.email}!
          </h1>
          <p className="text-gray-600">
            Get started with your home accessibility assessment
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start AR Assessment</h3>
            <p className="text-gray-600 mb-4">
              Use your phone camera to scan your home for accessibility issues
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start Assessment
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">My Assessments</h3>
            <p className="text-gray-600 mb-4">
              View your previous assessments and recommendations
            </p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              View All
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👷</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Contractors</h3>
            <p className="text-gray-600 mb-4">
              Browse vetted contractors in your area
            </p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Browse
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No activity yet</p>
            <p className="text-sm">Start your first AR assessment to get personalized recommendations</p>
          </div>
        </div>
      </main>
    </div>
  );
}

