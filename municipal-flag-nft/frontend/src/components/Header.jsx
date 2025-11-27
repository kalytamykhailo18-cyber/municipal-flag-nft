/**
 * Header Component with navigation and wallet connection
 */
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { connectWallet, disconnect, selectWallet } from '../store/slices/walletSlice';
import config from '../config';

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { address, balance, isConnected, isConnecting, isMetaMaskInstalled } = useSelector(selectWallet);

  const isActive = (path) => location.pathname === path;

  const handleConnect = () => dispatch(connectWallet());
  const handleDisconnect = () => dispatch(disconnect());

  return (
    <header className="bg-dark border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
            <span className="text-2xl">🏴</span>
            <span className="font-bold text-lg hidden sm:inline">Municipal Flag NFT</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/countries" active={isActive('/countries')}>Explore</NavLink>
            <NavLink to="/auctions" active={isActive('/auctions')}>Auctions</NavLink>
            <NavLink to="/rankings" active={isActive('/rankings')}>Rankings</NavLink>
            {isConnected && (
              <NavLink to="/profile" active={isActive('/profile')}>Profile</NavLink>
            )}
            <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
          </nav>

          {/* Wallet Section */}
          <div className="flex items-center gap-3">
            {!isMetaMaskInstalled ? (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-sm py-2"
              >
                Install MetaMask
              </a>
            ) : isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-primary font-medium text-sm">
                    {parseFloat(balance).toFixed(4)} MATIC
                  </span>
                  <span className="text-gray-400 text-xs">
                    {config.truncateAddress(address)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn btn-primary text-sm py-2"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t border-gray-800 px-4 py-2 flex justify-around">
        <MobileNavLink to="/countries" active={isActive('/countries')}>Explore</MobileNavLink>
        <MobileNavLink to="/auctions" active={isActive('/auctions')}>Auctions</MobileNavLink>
        <MobileNavLink to="/rankings" active={isActive('/rankings')}>Rankings</MobileNavLink>
        {isConnected && (
          <MobileNavLink to="/profile" active={isActive('/profile')}>Profile</MobileNavLink>
        )}
      </nav>
    </header>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-primary/20 text-primary'
        : 'text-gray-300 hover:text-white hover:bg-gray-800'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-3 py-1 text-xs font-medium transition-colors ${
      active ? 'text-primary' : 'text-gray-400 hover:text-white'
    }`}
  >
    {children}
  </Link>
);

export default Header;
