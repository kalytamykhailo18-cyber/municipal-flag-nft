/**
 * Municipality Detail Page - Show flags of a municipality
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMunicipality, selectCurrentMunicipality, selectCountriesLoading } from '../store/slices/countriesSlice';
import FlagCard from '../components/FlagCard';
import Loading from '../components/Loading';

const MunicipalityDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const municipality = useSelector(selectCurrentMunicipality);
  const loading = useSelector(selectCountriesLoading);

  useEffect(() => {
    dispatch(fetchMunicipality(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!municipality) return <ErrorDisplay message="Municipality not found" />;

  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <Link to="/countries">Countries</Link>
        <span>/</span>
        <Link to={`/regions/${municipality.region?.id}`}>{municipality.region?.name}</Link>
        <span>/</span>
        <span className="text-white">{municipality.name}</span>
      </nav>

      <div className="page-header">
        <h1 className="page-title">{municipality.name}</h1>
        <p className="page-subtitle font-mono">{municipality.coordinates}</p>
      </div>

      <div className="grid-cards">
        {municipality.flags?.map((flag) => (
          <FlagCard key={flag.id} flag={flag} />
        ))}
      </div>

      {(!municipality.flags || municipality.flags.length === 0) && (
        <div className="text-center py-16">
          <p className="text-gray-400">No flags available in this municipality.</p>
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

export default MunicipalityDetail;
