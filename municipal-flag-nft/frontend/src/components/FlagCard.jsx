/**
 * Flag Card Component - Displays a flag with its details
 */
import { Link } from 'react-router-dom';
import config from '../config';

const FlagCard = ({ flag, showMunicipality = false }) => {
  const getStatusBadge = () => {
    if (flag.is_pair_complete) {
      return <span className="badge badge-complete">Complete</span>;
    }
    if (flag.first_nft_status === 'claimed') {
      return <span className="badge badge-claimed">First Claimed</span>;
    }
    return <span className="badge badge-available">Available</span>;
  };

  const getCategoryBadge = () => {
    const categoryClass = flag.category.toLowerCase();
    return <span className={`badge badge-${categoryClass}`}>{flag.category}</span>;
  };

  const getImageUrl = () => {
    if (flag.image_ipfs_hash) {
      return config.getIpfsUrl(flag.image_ipfs_hash);
    }
    return `https://via.placeholder.com/300x300/1a1a2e/e94560?text=${encodeURIComponent(flag.location_type)}`;
  };

  return (
    <Link to={`/flags/${flag.id}`} className="card card-hover group block">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getImageUrl()}
          alt={flag.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x300/1a1a2e/e94560?text=${encodeURIComponent(flag.location_type)}`;
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {getCategoryBadge()}
          {getStatusBadge()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{flag.location_type}</h3>
        <p className="text-gray-400 text-sm mb-2 truncate">{flag.name}</p>
        {showMunicipality && flag.municipality && (
          <p className="text-gray-500 text-xs mb-2">{flag.municipality.name}</p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <span className="text-primary font-medium">{config.formatPrice(flag.price)} MATIC</span>
          <span className="text-gray-500 text-sm">{flag.interest_count || 0} interested</span>
        </div>
      </div>
    </Link>
  );
};

export default FlagCard;
