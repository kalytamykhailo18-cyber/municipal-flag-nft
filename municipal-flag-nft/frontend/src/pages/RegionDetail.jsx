/**
 * Region Detail Page - Show municipalities of a region
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRegion, selectCurrentRegion, selectCountriesLoading } from '../store/slices/countriesSlice';
import Loading from '../components/Loading';

const RegionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const region = useSelector(selectCurrentRegion);
  const loading = useSelector(selectCountriesLoading);

  useEffect(() => {
    dispatch(fetchRegion(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!region) return <ErrorDisplay message="Region not found" />;

  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <Link to="/countries">Countries</Link>
        <span>/</span>
        <Link to={`/countries/${region.country?.id}`}>{region.country?.name}</Link>
        <span>/</span>
        <span className="text-white">{region.name}</span>
      </nav>

      <div className="page-header">
        <h1 className="page-title">{region.name}</h1>
        <p className="page-subtitle">Select a municipality to view its flags</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {region.municipalities?.map((muni) => (
          <Link
            to={`/municipalities/${muni.id}`}
            key={muni.id}
            className="card card-hover p-6"
          >
            <h2 className="text-white font-semibold text-lg mb-1">{muni.name}</h2>
            <p className="text-gray-500 text-xs mb-2 font-mono">{muni.coordinates}</p>
            <p className="text-gray-400 text-sm">{muni.flag_count} flags</p>
          </Link>
        ))}
      </div>

      {(!region.municipalities || region.municipalities.length === 0) && (
        <div className="text-center py-16">
          <p className="text-gray-400">No municipalities available in this region.</p>
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

export default RegionDetail;
