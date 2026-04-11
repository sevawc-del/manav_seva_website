import React from 'react';

const WomenEmpowerment = () => {
  const programs = [
    {
      id: 1,
      title: 'Skill Development Training',
      description: 'Vocational training in tailoring, computer skills, and entrepreneurship.',
      duration: '6 months',
      participants: 150
    },
    {
      id: 2,
      title: 'Financial Literacy Program',
      description: 'Education on banking, savings, and microfinance opportunities.',
      duration: '3 months',
      participants: 200
    },
    {
      id: 3,
      title: 'Legal Rights Awareness',
      description: 'Workshops on women\'s rights, legal protection, and support services.',
      duration: '2 months',
      participants: 300
    },
    {
      id: 4,
      title: 'Health and Nutrition Initiative',
      description: 'Programs focused on women\'s health, nutrition, and family planning.',
      duration: 'Ongoing',
      participants: 500
    }
  ];

  const successStories = [
    {
      name: 'Priya Sharma',
      story: 'Started her own tailoring business after completing our skill training program.',
      image: '/images/success1.jpg'
    },
    {
      name: 'Anita Gupta',
      story: 'Became a computer teacher and now trains other women in digital skills.',
      image: '/images/success2.jpg'
    },
    {
      name: 'Kavita Singh',
      story: 'Opened a small grocery store with microfinance support from our program.',
      image: '/images/success3.jpg'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Women Empowerment</h1>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            Empowering women through education, skill development, and economic independence.
            We believe that when women are empowered, entire communities thrive.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-4xl text-[var(--ngo-primary)] mb-2">👩‍🎓</div>
              <h3 className="text-lg font-medium">Education</h3>
              <p className="text-gray-600 text-sm">Literacy and skill development programs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl text-blue-500 mb-2">💼</div>
              <h3 className="text-lg font-medium">Employment</h3>
              <p className="text-gray-600 text-sm">Job training and placement assistance</p>
            </div>
            <div className="text-center">
              <div className="text-4xl text-green-500 mb-2">⚖️</div>
              <h3 className="text-lg font-medium">Rights</h3>
              <p className="text-gray-600 text-sm">Legal awareness and protection</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Our Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{program.title}</h3>
                <p className="text-gray-700 mb-3">{program.description}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span><strong>Duration:</strong> {program.duration}</span>
                  <span><strong>Participants:</strong> {program.participants}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div key={index} className="text-center">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=Success+Story';
                  }}
                />
                <h3 className="text-lg font-medium mb-2">{story.name}</h3>
                <p className="text-gray-600 text-sm">{story.story}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomenEmpowerment;
