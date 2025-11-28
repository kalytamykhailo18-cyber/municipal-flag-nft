/**
 * Auction Detail Page - View auction details and place bids
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAuction,
  placeBid,
  selectCurrentAuction,
  selectAuctionsLoading,
  clearCurrentAuction,
} from '../store/slices/auctionsSlice';
import { selectAddress, selectIsConnected, connectWallet } from '../store/slices/walletSlice';
import Loading from '../components/Loading';
import config from '../config';

const AuctionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const auction = useSelector(selectCurrentAuction);
  const loading = useSelector(selectAuctionsLoading);
  const address = useSelector(selectAddress);
  const isConnected = useSelector(selectIsConnected);

  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    dispatch(fetchAuction(id));
    return () => {
      dispatch(clearCurrentAuction());
    };
  }, [dispatch, id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    setBidding(true);
    try {
      await dispatch(placeBid({
        auctionId: parseInt(id),
        walletAddress: address,
        amount: parseFloat(bidAmount)
      })).unwrap();

      alert('Bid placed successfully!');
      setBidAmount('');
    } catch (error) {
      alert(error || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const handleConnect = () => dispatch(connectWallet());

  if (loading && !auction) return <Loading text="Loading auction details..." />;
  if (!auction) {
    return (
      <div className="page-container">
        <div className="text-center py-16">
          <p className="text-red-400">Auction not found</p>
          <Link to="/auctions" className="text-primary hover:text-primary-light mt-4 inline-block">
            ← Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = auction.flag?.image_ipfs_hash
    ? config.getIpfsUrl(auction.flag.image_ipfs_hash)
    : null;

  const timeRemaining = new Date(auction.ends_at) - new Date();
  const isEnded = timeRemaining <= 0 || auction.status !== 'active';
  const isSeller = address?.toLowerCase() === auction.seller?.wallet_address?.toLowerCase();
  const minBid = auction.current_highest_bid || auction.starting_price;

  const formatTimeRemaining = () => {
    if (isEnded) return 'Ended';
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-6">
        <Link to="/auctions">Auctions</Link>
        <span>/</span>
        <span className="text-white">Auction #{auction.id}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <div className="card overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Flag" className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-dark-darker flex items-center justify-center">
                <div className="text-gray-600 text-lg">Flag #{auction.flag_id}</div>
              </div>
            )}
          </div>

          {/* Flag Info */}
          {auction.flag && (
            <div className="mt-4">
              <Link
                to={`/flags/${auction.flag_id}`}
                className="text-primary hover:text-primary-light"
              >
                View Flag Details →
              </Link>
              <div className="flex gap-2 mt-2">
                {auction.flag.category && (
                  <span className={`badge badge-${auction.flag.category.toLowerCase()}`}>
                    {auction.flag.category}
                  </span>
                )}
                {auction.flag.location_type && (
                  <span className="badge badge-available">{auction.flag.location_type}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Auction Info Section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {auction.flag?.name || `Flag #${auction.flag_id}`}
          </h1>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`badge ${isEnded ? 'bg-gray-600' : 'bg-yellow-600'} text-white`}>
              {auction.status === 'active' ? (isEnded ? 'Time Ended' : 'Active') : auction.status}
            </span>
          </div>

          {/* Auction Stats */}
          <div className="card p-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Starting Price:</span>
                <span className="text-white font-semibold">
                  {config.formatPrice(auction.starting_price)} POL
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Bid:</span>
                <span className="text-primary text-xl font-bold">
                  {config.formatPrice(auction.current_highest_bid || auction.starting_price)} POL
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Time Remaining:</span>
                <span className={`font-semibold ${isEnded ? 'text-gray-500' : 'text-white'}`}>
                  {formatTimeRemaining()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Bids:</span>
                <span className="text-white font-semibold">{auction.bid_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ends At:</span>
                <span className="text-white font-semibold">
                  {new Date(auction.ends_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="card p-6 mb-6">
            <h3 className="text-white font-semibold mb-2">Seller</h3>
            <p className="text-gray-400 font-mono text-sm">
              {config.truncateAddress(auction.seller?.wallet_address, 8)}
            </p>
            {auction.seller?.reputation_score !== undefined && (
              <p className="text-gray-500 text-sm mt-1">
                Reputation: {auction.seller.reputation_score}
              </p>
            )}
          </div>

          {/* Highest Bidder */}
          {auction.highest_bidder && (
            <div className="card p-6 mb-6 bg-primary/10 border-primary/30">
              <h3 className="text-white font-semibold mb-2">Highest Bidder</h3>
              <p className="text-primary font-mono text-sm">
                {config.truncateAddress(auction.highest_bidder.wallet_address, 8)}
              </p>
            </div>
          )}

          {/* Bid Form */}
          {!isEnded && auction.status === 'active' && (
            <div className="card p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Place a Bid</h3>

              {!isConnected ? (
                <button onClick={handleConnect} className="btn btn-primary w-full">
                  Connect Wallet to Bid
                </button>
              ) : isSeller ? (
                <div className="text-gray-500 text-center py-4">
                  You cannot bid on your own auction
                </div>
              ) : (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Bid Amount (POL)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min={minBid + 0.001}
                      required
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min: ${config.formatPrice(minBid + 0.001)}`}
                      className="w-full px-4 py-2 bg-dark-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Minimum bid: {config.formatPrice(minBid + 0.001)} POL
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={bidding}
                  >
                    {bidding ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </form>
              )}
            </div>
          )}

          {isEnded && auction.status === 'active' && (
            <div className="card p-4 bg-yellow-600/10 border-yellow-600/30 text-center mb-6">
              <p className="text-yellow-600">
                This auction has ended and is waiting to be closed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      {auction.bids && auction.bids.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Bid History ({auction.bids.length})</h2>
          <div className="card divide-y divide-gray-800">
            {auction.bids.map((bid) => (
              <div key={bid.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-mono text-sm">
                    {config.truncateAddress(bid.bidder?.wallet_address, 8)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {new Date(bid.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">
                    {config.formatPrice(bid.amount)} POL
                  </p>
                  {bid.bidder_id === auction.highest_bidder_id && (
                    <span className="text-xs text-yellow-600">Highest Bid</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;
