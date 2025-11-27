/**
 * Admin Page - Admin panel for managing the game
 */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  authenticate,
  fetchAdminCountries,
  seedDemoData,
  toggleCountryVisibility,
  selectAdminAuthenticated,
  selectAdminStats,
  selectAdminCountries,
  selectAdminLoading,
  selectAdminMessage,
  selectAdminError,
  clearMessage,
} from '../store/slices/adminSlice';
import Loading from '../components/Loading';

const Admin = () => {
  const dispatch = useDispatch();
  const [adminKey, setAdminKey] = useState('');
  const authenticated = useSelector(selectAdminAuthenticated);
  const stats = useSelector(selectAdminStats);
  const countries = useSelector(selectAdminCountries);
  const loading = useSelector(selectAdminLoading);
  const message = useSelector(selectAdminMessage);
  const error = useSelector(selectAdminError);

  useEffect(() => {
    if (authenticated) {
      dispatch(fetchAdminCountries());
    }
  }, [dispatch, authenticated]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => dispatch(clearMessage()), 5000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, message, error]);

  const handleAuth = () => dispatch(authenticate(adminKey));
  const handleSeed = () => dispatch(seedDemoData());
  const handleToggle = (countryId, isVisible) => dispatch(toggleCountryVisibility({ countryId, isVisible }));

  if (!authenticated) {
    return (
      <div className="page-container">
        <div className="max-w-md mx-auto py-20">
          <div className="card p-8">
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Admin Panel</h1>
            <p className="text-gray-400 text-center mb-6">Enter your admin API key to continue</p>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin API Key"
              className="input mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button
              onClick={handleAuth}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Authenticating...' : 'Access Admin'}
            </button>
            {error && (
              <p className="text-red-400 text-sm text-center mt-4">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title mb-8">Admin Panel</h1>

      {/* Messages */}
      {message && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Countries" value={stats.total_countries} />
            <StatCard label="Regions" value={stats.total_regions} />
            <StatCard label="Municipalities" value={stats.total_municipalities} />
            <StatCard label="Flags" value={stats.total_flags} />
            <StatCard label="Users" value={stats.total_users} />
            <StatCard label="Completed Pairs" value={stats.completed_pairs} />
          </div>
        )}
      </section>

      {/* Demo Data */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Demo Data</h2>
        <div className="card p-6">
          <p className="text-gray-400 mb-4">
            Seed the database with demo countries, regions, municipalities, and flags.
          </p>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Seeding...' : 'Seed Demo Data'}
          </button>
        </div>
      </section>

      {/* Countries Management */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Countries</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-darker">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Code</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Visible</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {countries.map((country) => (
                <tr key={country.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-300">{country.id}</td>
                  <td className="px-4 py-3 text-white">{country.name}</td>
                  <td className="px-4 py-3 text-gray-400">{country.code}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${country.is_visible ? 'badge-available' : 'bg-gray-600 text-gray-300'}`}>
                      {country.is_visible ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(country.id, country.is_visible)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        country.is_visible
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      }`}
                    >
                      {country.is_visible ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {countries.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No countries found. Seed the demo data first.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="card p-4 text-center">
    <span className="text-2xl font-bold text-primary block">{value}</span>
    <span className="text-gray-400 text-sm">{label}</span>
  </div>
);

export default Admin;
