import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import { getJourneys } from '../utils/api';

const Home = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const response = await getJourneys();
        setJourneys(response.data);
      } catch (error) {
        console.error('Error fetching journeys:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, []);

  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Welcome to Manav Seva</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Health Campaigns</h3>
            <p className="text-gray-700">Providing medical aid and health awareness programs to communities in need.</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Education Initiatives</h3>
            <p className="text-gray-700">Supporting education through scholarships and learning programs.</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Women Empowerment</h3>
            <p className="text-gray-700">Empowering women through skill development and support programs.</p>
          </div>
        </div>

        {/* Journey Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
          {loading ? (
            <div className="text-center">Loading journey...</div>
          ) : journeys.length > 0 ? (
            <div className="space-y-8">
              {journeys.map((journey) => (
                <div key={journey._id} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">{journey.year}</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {journey.milestones.map((milestone, index) => (
                      <li key={index} className="text-gray-700">{milestone}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No journey data available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
