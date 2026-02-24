import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGallery } from '../utils/api';
import Loader from '../components/Loader';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await getGallery();
        setImages(response.data);
      } catch (err) {
        setError('Failed to load gallery images');
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gallery</h1>
      {images.length === 0 ? (
        <div className="text-center text-gray-500">No images available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Link
              key={image._id}
              to={`/gallery/${image._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden block hover:shadow-lg transition-shadow"
            >
              <img
                src={image.image || image.imageUrl || 'https://via.placeholder.com/400x300?text=Image+Not+Available'}
                alt={image.title || image.description || 'Gallery Image'}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
              <div className="p-4">
                <p className="text-gray-700">{image.title || image.description || 'Gallery Image'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
