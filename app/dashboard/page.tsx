'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { useAuthStore } from '@/lib/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BAND IT POWER</h1>
            <p className="text-sm text-gray-600">The Social Network for Collective Action</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName || user.firstName}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to collaborate and make things happen?
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {user.displayName || `${user.firstName} ${user.lastName}`}
              </h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Active
            </span>
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
            {user.bio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bio</h4>
                <p className="text-gray-600">{user.bio}</p>
              </div>
            )}

            {user.location && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Location</h4>
                <p className="text-gray-600">📍 {user.location}</p>
              </div>
            )}

            {user.timezone && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Timezone</h4>
                <p className="text-gray-600">🕐 {user.timezone}</p>
              </div>
            )}

            {user.skills && user.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                    >
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.passions && user.passions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Passions</h4>
                <div className="flex flex-wrap gap-2">
                  {user.passions.map((passion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-800 text-sm font-medium rounded-full"
                    >
                      ❤️ {passion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.wantsToLearn && user.wantsToLearn.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Wants to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {user.wantsToLearn.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full"
                    >
                      📚 {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.hoursPerWeek && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Availability</h4>
                <p className="text-gray-600">⏰ {user.hoursPerWeek} hours per week</p>
              </div>
            )}

            {user.remoteOnly !== undefined && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Work Preference</h4>
                <p className="text-gray-600">
                  {user.remoteOnly ? '💻 Remote only' : '🤝 Open to in-person'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Quick Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/bands" className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition cursor-pointer">
                <p className="font-medium text-gray-900 mb-1">🏢 Bands</p>
                <p className="text-sm text-gray-600">View and manage bands</p>
              </Link>
              <Link href="/proposals" className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition cursor-pointer">
                <p className="font-medium text-gray-900 mb-1">📝 Proposals</p>
                <p className="text-sm text-gray-600">View all your proposals</p>
              </Link>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">🔍 Discover</p>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}