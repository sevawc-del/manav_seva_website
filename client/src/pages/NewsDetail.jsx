import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getNewsById, getNewsBySlug } from '../utils/api';
import Loader from '../components/Loader';

const NewsDetail = () => {
  const { slug } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        let response;
        try {
          response = await getNewsBySlug(slug);
        } catch (slugError) {
          response = await getNewsById(slug);
        }
        setNewsItem(response.data);
      } catch (err) {
        console.error('Error fetching news detail:', err);
        setError('News not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <Link to="/news-events" className="app-btn app-btn-primary">
          Back to News
        </Link>
      </div>
    );
  }
  if (!newsItem) return null;

  const displayDate = newsItem.date || newsItem.createdAt;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/news-events" className="app-btn app-btn-outline">
          Back to News
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <img
          src={newsItem.image || 'https://via.placeholder.com/1200x600?text=News+Image'}
          alt={newsItem.title}
          className="w-full h-64 md:h-96 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x600?text=News+Image';
          }}
        />
        <div className="p-6 md:p-8">
          <p className="text-sm text-gray-500 mb-3">
            {displayDate ? new Date(displayDate).toLocaleDateString() : 'Date not available'}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{newsItem.title}</h1>
          <p className="text-gray-700 whitespace-pre-line">{newsItem.content || ''}</p>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;
