import React from 'react';

const HealthCampaigns = () => {
  const campaigns = [
    {
      id: 1,
      title: 'Rural Health Outreach Program',
      description: 'Comprehensive health checkups and medical aid in rural areas.',
      location: 'Multiple villages in Rajasthan',
      beneficiaries: 2500,
      status: 'Ongoing'
    },
    {
      id: 2,
      title: 'Maternal and Child Health Initiative',
      description: 'Specialized healthcare for mothers and children under 5 years.',
      location: 'Urban slums in Delhi',
      beneficiaries: 1800,
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Eye Care Camp',
      description: 'Free eye checkups, cataract surgeries, and distribution of spectacles.',
      location: 'Tribal areas in Madhya Pradesh',
      beneficiaries: 1200,
      status: 'Ongoing'
    },
    {
      id: 4,
      title: 'Dental Health Awareness',
      description: 'Oral health education and free dental treatments.',
      location: 'Schools in Uttar Pradesh',
      beneficiaries: 3500,
      status: 'Planning'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Health Campaigns</h1>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Our Health Initiatives</h2>
          <p className="text-gray-700 mb-6">
            Manav Seva conducts various health campaigns to provide medical care and health
            awareness to underserved communities. Our programs focus on preventive healthcare,
            treatment, and health education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-700 mb-4">{campaign.description}</p>
              <div className="space-y-2 text-sm">
                <p><strong>Location:</strong> {campaign.location}</p>
                <p><strong>Beneficiaries:</strong> {campaign.beneficiaries.toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-semibold mb-6">Services Provided</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl text-blue-500 mb-2">🏥</div>
              <h3 className="text-lg font-medium mb-2">Medical Checkups</h3>
              <p className="text-gray-600 text-sm">General health examinations and consultations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-green-500 mb-2">💊</div>
              <h3 className="text-lg font-medium mb-2">Medicine Distribution</h3>
              <p className="text-gray-600 text-sm">Free medicines for common ailments</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-[var(--ngo-primary)] mb-2">📚</div>
              <h3 className="text-lg font-medium mb-2">Health Education</h3>
              <p className="text-gray-600 text-sm">Awareness programs on hygiene and nutrition</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCampaigns;
