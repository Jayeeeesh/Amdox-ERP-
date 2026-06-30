import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.data.stats);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load dashboard'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const statCards = [
    {
      label: 'Total Employees',
      value: stats?.employees?.total ?? 0,
      sub: `${stats?.employees?.active ?? 0} active`,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Total Users',
      value: stats?.users?.total ?? 0,
      sub: `${stats?.users?.active ?? 0} active`,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(stats?.finance?.netBalance),
      sub: `${stats?.finance?.totalTransactions ?? 0} transactions`,
      color:
        (stats?.finance?.netBalance ?? 0) >= 0
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700',
    },
    {
      label: 'Purchase Orders',
      value: stats?.orders?.total ?? 0,
      sub: formatCurrency(stats?.orders?.totalAmount),
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Amdox ERP</h1>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-28"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${card.color}`}
                >
                  {card.sub}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'HR', desc: 'Manage employees' },
              { name: 'Finance', desc: 'Track transactions' },
              { name: 'Supply Chain', desc: 'Purchase orders' },
              { name: 'Users', desc: 'Manage accounts' },
            ].map((mod) => (
              <div
                key={mod.name}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
              >
                <p className="font-medium text-gray-900">{mod.name}</p>
                <p className="text-sm text-gray-500 mt-1">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;