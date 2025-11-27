/**
 * Profile Page - User's profile with flags and interests
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { connectWallet, selectAddress, selectIsConnected } from '../store/slices/walletSlice';
import { fetchUserData, selectUserProfile, selectUserFlags, selectUserInterests, selectUserLoading } from '../store/slices/userSlice';
import Loading from '../components/Loading';
import config from '../config';

const Profile = () => {
  const dispatch = useDispatch();
  const address = useSelector(selectAddress);
  const isConnected = useSelector(selectIsConnected);
  const profile = useSelector(selectUserProfile);
  const flags = useSelector(selectUserFlags);
  const interests = useSelector(selectUserInterests);
  const loading = useSelector(selectUserLoading);

  useEffect(() => {
    if (isConnected && address) {
      dispatch(fetchUserData(address));
    }
  }, [dispatch, isConnected, address]);

  const handleConnect = () => dispatch(connectWallet());

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
            {flags.map((ownership) => (
              <Link
                key={ownership.id}
                to={`/flags/${ownership.flag_id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-white">Flag #{ownership.flag_id}</span>
                <span className="badge badge-available">{ownership.ownership_type}</span>
              </Link>
            ))}
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
    </div>
  );
};

export default Profile;
