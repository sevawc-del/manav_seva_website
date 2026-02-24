import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getGalleryItemById } from '../utils/api';
import Loader from '../components/Loader';

const GalleryDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const openedFromHome = location.state?.from === 'home';
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGalleryItem = async () => {
      try {
        const response = await getGalleryItemById(id);
        setItem(response.data);
      } catch (err) {
        setError('Failed to load gallery image');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItem();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  if (!item) return <div className="container mx-auto px-4 py-8 text-center text-gray-600">Image not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        {openedFromHome && (
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Back to Home
          </Link>
        )}
        <Link to="/gallery" className="text-blue-600 hover:text-blue-800">
          Go to Gallery 
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-5xl mx-auto">
        <img
          src={item.image || item.imageUrl || 'https://via.placeholder.com/1200x800?text=Image+Not+Available'}
          alt={item.title || item.description || 'Gallery Image'}
          className="w-full h-auto max-h-[80vh] object-contain bg-gray-100"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x800?text=Image+Not+Available';
          }}
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-3">{item.title || 'Gallery Image'}</h1>
          <p className="text-gray-700 whitespace-pre-line">{item.description || 'No description available.'}</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetail;
