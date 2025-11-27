/**
 * Countries Page - List all countries
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountries, selectCountries, selectCountriesLoading, selectCountriesError } from '../store/slices/countriesSlice';
import Loading from '../components/Loading';

const Countries = () => {
  const dispatch = useDispatch();
  const countries = useSelector(selectCountries);
  const loading = useSelector(selectCountriesLoading);
  const error = useSelector(selectCountriesError);

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const getCountryEmoji = (code) => {
    const emojis = { ESP: '🇪🇸', FRA: '🇫🇷', DEU: '🇩🇪', ITA: '🇮🇹' };
    return emojis[code] || '🏴';
  };

  if (loading && countries.length === 0) return <Loading text="Loading countries..." />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Explore Countries</h1>
        <p className="page-subtitle">Select a country to explore its regions and municipal flags</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {countries.map((country) => (
          <Link
            to={`/countries/${country.id}`}
            key={country.id}
            className="card card-hover p-6 flex items-center gap-4"
          >
            <span className="text-5xl">{getCountryEmoji(country.code)}</span>
            <div>
              <h2 className="text-white font-semibold text-lg">{country.name}</h2>
              <span className="text-gray-500 text-sm">{country.code}</span>
              <p className="text-gray-400 text-sm mt-1">
                {country.region_count} {country.region_count === 1 ? 'region' : 'regions'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {countries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No countries available. Please seed the demo data.</p>
        </div>
      )}
    </div>
  );
};

const ErrorDisplay = ({ message }) => (
  <div className="page-container">
    <div className="text-center py-16">
      <p className="text-red-400">Error: {message}</p>
    </div>
  </div>
);

export default Countries;
