import React, { useState, useEffect } from 'react';
import { getJobs } from '../../utils/api';

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        setJobs(response.data);
      } catch (err) {
        setError('Failed to load job opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading job opportunities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Career Opportunities</h1>
      <div className="max-w-4xl mx-auto">
        {jobs.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">
              Join our team at Manav Seva and make a difference in the community.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We are always looking for passionate individuals who want to contribute to our mission of serving humanity.
            </p>
            <p className="text-lg text-gray-700">
              Currently, there are no open positions. Please check back later or contact us for volunteering opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{job.title}</h2>
                    <p className="text-gray-600">{job.location} • {job.type}</p>
                  </div>
                  {job.salary && <span className="text-green-600 font-semibold">{job.salary}</span>}
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{job.description}</p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Requirements</h3>
                  <p className="text-gray-600">{job.requirements}</p>
                </div>

                {job.applicationDeadline && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Career;
