/**
 * Auctions Page - Active auctions list
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAuctions, selectAuctions, selectAuctionsLoading } from '../store/slices/auctionsSlice';
import Loading from '../components/Loading';
import config from '../config';

const Auctions = () => {
  const dispatch = useDispatch();
  const auctions = useSelector(selectAuctions);
  const loading = useSelector(selectAuctionsLoading);

  useEffect(() => {
    dispatch(fetchAuctions(true));
  }, [dispatch]);

  if (loading && auctions.length === 0) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Active Auctions</h1>
        <p className="page-subtitle">Bid on flags from other collectors</p>
      </div>

      {auctions.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <Link
              to={`/auctions/${auction.id}`}
              key={auction.id}
              className="card card-hover overflow-hidden"
            >
              <div className="aspect-video bg-dark-darker flex items-center justify-center">
                {auction.flag?.image_ipfs_hash ? (
                  <img
                    src={config.getIpfsUrl(auction.flag.image_ipfs_hash)}
                    alt="Flag"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-600 text-lg">Flag #{auction.flag_id}</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">
                  {auction.flag?.location_type || `Flag #${auction.flag_id}`}
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Current Bid:</span>
                  <span className="text-primary font-semibold">
                    {config.formatPrice(auction.current_highest_bid || auction.starting_price)} MATIC
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{auction.bid_count} bids</span>
                  <span>Ends: {new Date(auction.ends_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="card max-w-md mx-auto p-8">
            <h3 className="text-xl text-white mb-2">No Active Auctions</h3>
            <p className="text-gray-400">There are no active auctions at the moment. Check back later!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auctions;
