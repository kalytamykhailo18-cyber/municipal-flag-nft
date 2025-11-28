/**
 * Profile Page - User's profile with flags and interests
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { connectWallet, selectAddress, selectIsConnected } from '../store/slices/walletSlice';
import { fetchUserData, selectUserProfile, selectUserFlags, selectUserInterests, selectUserLoading } from '../store/slices/userSlice';
import Loading from '../components/Loading';
import config from '../config';
import api from '../services/api';

const Profile = () => {
  const dispatch = useDispatch();
  const address = useSelector(selectAddress);
  const isConnected = useSelector(selectIsConnected);
  const profile = useSelector(selectUserProfile);
  const flags = useSelector(selectUserFlags);
  const interests = useSelector(selectUserInterests);
  const loading = useSelector(selectUserLoading);

  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [auctionData, setAuctionData] = useState({
    starting_price: '',
    duration_hours: 168 // 7 days default
  });
  const [creating, setCreating] = useState(false);
  const [activeAuctions, setActiveAuctions] = useState([]);

  useEffect(() => {
    if (isConnected && address) {
      dispatch(fetchUserData(address));
      loadActiveAuctions();
    }
  }, [dispatch, isConnected, address]);

  const loadActiveAuctions = async () => {
    try {
      const response = await api.get('/auctions?active_only=true');
      // The data might be in response directly, not response.data
      const auctions = response.data || response || [];
      setActiveAuctions(Array.isArray(auctions) ? auctions : []);
    } catch (error) {
      console.error('Failed to load auctions:', error);
    }
  };

  const hasActiveAuction = (flagId) => {
    return activeAuctions?.some(auction => auction.flag_id === flagId) || false;
  };

  const handleConnect = () => dispatch(connectWallet());

  const handleCreateAuction = (flag) => {
    setSelectedFlag(flag);
    setShowAuctionModal(true);
  };

  const handleSubmitAuction = async (e) => {
    e.preventDefault();
    if (!selectedFlag || !address) return;

    setCreating(true);
    try {
      await api.post('/auctions', {
        flag_id: selectedFlag.flag_id,
        wallet_address: address,
        starting_price: parseFloat(auctionData.starting_price),
        duration_hours: parseInt(auctionData.duration_hours)
      });

      alert('Auction created successfully! Check the Auctions page.');

      // Close modal and reset
      setShowAuctionModal(false);
      setAuctionData({ starting_price: '', duration_hours: 168 });
      setSelectedFlag(null);

      // Refresh user data and auctions to update the UI
      dispatch(fetchUserData(address));
      loadActiveAuctions();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create auction');
    } finally {
      setCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="max-w-md mx-auto text-center py-20">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Please connect your wallet to view your profile</p>
            <button onClick={handleConnect} className="btn btn-primary">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="text-gray-400 font-mono">{config.truncateAddress(address, 8)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <span className="stat-value">{profile?.reputation_score || 0}</span>
          <span className="stat-label">Reputation</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{flags.length}</span>
          <span className="stat-label">Flags Owned</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{interests.length}</span>
          <span className="stat-label">Interests</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile?.followers_count || 0}</span>
          <span className="stat-label">Followers</span>
        </div>
      </div>

      {/* My Flags */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">My Flags ({flags.length})</h2>
        {flags.length > 0 ? (
          <div className="card divide-y divide-gray-800">
            {flags.map((ownership) => {
              const hasAuction = hasActiveAuction(ownership.flag_id);
              return (
                <div
                  key={ownership.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <Link to={`/flags/${ownership.flag_id}`} className="flex-1">
                    <span className="text-white">Flag #{ownership.flag_id}</span>
                    <span className="badge badge-available ml-2">{ownership.ownership_type}</span>
                    {hasAuction && (
                      <span className="badge bg-yellow-600 text-white ml-2">🔨 In Auction</span>
                    )}
                  </Link>
                  <button
                    onClick={() => handleCreateAuction(ownership)}
                    className="btn btn-primary btn-sm ml-4"
                    disabled={hasAuction}
                  >
                    {hasAuction ? 'Already in Auction' : 'Create Auction'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-gray-500">You don't own any flags yet</p>
            <Link to="/countries" className="text-primary hover:text-primary-light mt-2 inline-block">
              Start exploring →
            </Link>
          </div>
        )}
      </section>

      {/* My Interests */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">My Interests ({interests.length})</h2>
        {interests.length > 0 ? (
          <div className="card divide-y divide-gray-800">
            {interests.map((interest) => (
              <Link
                key={interest.id}
                to={`/flags/${interest.flag_id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-white">Flag #{interest.flag_id}</span>
                <span className="text-gray-500 text-sm">
                  {new Date(interest.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-gray-500">You haven't shown interest in any flags</p>
          </div>
        )}
      </section>

      {/* Create Auction Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Auction</h3>
            <p className="text-gray-400 mb-4">Flag #{selectedFlag?.flag_id}</p>

            <form onSubmit={handleSubmitAuction} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Starting Price (POL)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  value={auctionData.starting_price}
                  onChange={(e) => setAuctionData({ ...auctionData, starting_price: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                  placeholder="0.05"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Duration (hours)
                </label>
                <select
                  value={auctionData.duration_hours}
                  onChange={(e) => setAuctionData({ ...auctionData, duration_hours: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                >
                  <option value="24">1 Day</option>
                  <option value="72">3 Days</option>
                  <option value="168">7 Days</option>
                  <option value="336">14 Days</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuctionModal(false);
                    setSelectedFlag(null);
                  }}
                  className="btn btn-secondary flex-1"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
