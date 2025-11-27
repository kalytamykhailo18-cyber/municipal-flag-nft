/**
 * Country Detail Page - Show regions of a country
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountry, selectCurrentCountry, selectCountriesLoading } from '../store/slices/countriesSlice';
import Loading from '../components/Loading';

const CountryDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const country = useSelector(selectCurrentCountry);
  const loading = useSelector(selectCountriesLoading);

  useEffect(() => {
    dispatch(fetchCountry(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!country) return <ErrorDisplay message="Country not found" />;

  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <Link to="/countries">Countries</Link>
        <span>/</span>
        <span className="text-white">{country.name}</span>
      </nav>

      <div className="page-header">
        <h1 className="page-title">{country.name}</h1>
        <p className="page-subtitle">Select a region to explore municipalities</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {country.regions?.map((region) => (
          <Link
            to={`/regions/${region.id}`}
            key={region.id}
            className="card card-hover p-6"
          >
            <h2 className="text-white font-semibold text-lg mb-2">{region.name}</h2>
            <p className="text-gray-400 text-sm">{region.municipality_count} municipalities</p>
          </Link>
        ))}
      </div>

      {(!country.regions || country.regions.length === 0) && (
        <div className="text-center py-16">
          <p className="text-gray-400">No regions available in this country.</p>
        </div>
      )}
    </div>
  );
};

const ErrorDisplay = ({ message }) => (
  <div className="page-container">
    <div className="text-center py-16">
      <p className="text-red-400">{message}</p>
    </div>
  </div>
);

export default CountryDetail;
