/**
 * Home Page - Landing page for the application
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountries, selectCountries, selectCountriesLoading } from '../store/slices/countriesSlice';
import { fetchPopularFlags, selectPopularFlags } from '../store/slices/flagsSlice';
import FlagCard from '../components/FlagCard';
import Loading from '../components/Loading';

const Home = () => {
  const dispatch = useDispatch();
  const countries = useSelector(selectCountries);
  const popularFlags = useSelector(selectPopularFlags);
  const loading = useSelector(selectCountriesLoading);

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchPopularFlags(4));
  }, [dispatch]);

  if (loading && countries.length === 0) return <Loading text="Loading..." />;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark via-secondary to-dark py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Collect <span className="text-gradient">Municipal Flags</span> as NFTs
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Discover and collect unique flags from municipalities around the world.
            Each flag is an AI-generated NFT on the Polygon network.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/countries" className="btn btn-primary">
              Start Exploring
            </Link>
            <Link to="/rankings" className="btn btn-outline">
              View Rankings
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12">
            <div className="stat-card">
              <span className="stat-value">{countries.length}</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">64</span>
              <span className="stat-label">Unique Flags</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">3</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="page-container py-16">
        <h2 className="section-title text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <StepCard number="1" title="Express Interest">
            Claim the first NFT of a flag pair for free to show your interest.
          </StepCard>
          <StepCard number="2" title="Complete the Pair">
            Purchase the second NFT to complete your collection and remove it from the game.
          </StepCard>
          <StepCard number="3" title="Earn Discounts">
            Collect Plus and Premium flags to unlock discounts on future purchases.
          </StepCard>
          <StepCard number="4" title="Trade & Social">
            Participate in auctions, follow collectors, and climb the rankings.
          </StepCard>
        </div>
      </section>

      {/* Popular Flags */}
      {popularFlags.length > 0 && (
        <section className="page-container py-16 bg-dark">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title mb-0">Popular Flags</h2>
            <Link to="/countries" className="text-primary hover:text-primary-light transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid-cards">
            {popularFlags.map((flag) => (
              <FlagCard key={flag.id} flag={flag} showMunicipality />
            ))}
          </div>
        </section>
      )}

      {/* Countries Preview */}
      <section className="page-container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title mb-0">Explore Countries</h2>
          <Link to="/countries" className="text-primary hover:text-primary-light transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {countries.slice(0, 4).map((country) => (
            <Link
              to={`/countries/${country.id}`}
              key={country.id}
              className="card card-hover p-6 text-center"
            >
              <span className="text-5xl mb-4 block">{getCountryEmoji(country.code)}</span>
              <h3 className="text-white font-semibold text-lg mb-1">{country.name}</h3>
              <span className="text-gray-400 text-sm">{country.region_count} regions</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-16 bg-dark">
        <h2 className="section-title text-center">Flag Categories</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6 border-gray-600">
            <h3 className="text-white font-bold text-xl mb-2">Standard</h3>
            <p className="text-gray-400">Base flags with no special benefits</p>
          </div>
          <div className="card p-6 border-blue-600">
            <h3 className="text-blue-400 font-bold text-xl mb-2">Plus</h3>
            <p className="text-gray-400">50% discount on future Standard purchases</p>
          </div>
          <div className="card p-6 border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-amber-500/10">
            <h3 className="text-yellow-400 font-bold text-xl mb-2">Premium</h3>
            <p className="text-gray-400">75% permanent discount on Standard flags</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const StepCard = ({ number, title, children }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{children}</p>
  </div>
);

const getCountryEmoji = (code) => {
  const emojis = { ESP: '🇪🇸', FRA: '🇫🇷', DEU: '🇩🇪', ITA: '🇮🇹' };
  return emojis[code] || '🏴';
};

export default Home;
