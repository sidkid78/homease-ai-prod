import { getServerSession } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ContractorDashboard() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'contractor' && session.user.role !== 'admin') {
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
            <span className="text-sm text-gray-600">Contractor Dashboard</span>
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
            Welcome, {session.user.name || session.user.email}!
          </h1>
          <p className="text-gray-600">
            Manage your leads and grow your accessibility business
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">New Leads</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600">Active Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-gray-600">Reviews</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Lead Marketplace</h3>
            <p className="text-gray-600 mb-4">
              Browse and purchase qualified leads in your area
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Browse Leads
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">My Profile</h3>
            <p className="text-gray-600 mb-4">
              Manage your business profile and credentials
            </p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Edit Profile
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Messages</h3>
            <p className="text-gray-600 mb-4">
              Chat with homeowners and manage inquiries
            </p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              View Messages
            </button>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Leads</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No leads yet</p>
            <p className="text-sm">Check the lead marketplace to find qualified projects</p>
          </div>
        </div>
      </main>
    </div>
  );
}

