import React, { useState } from 'react';
import { InfoPageLayout } from '../../components/common/InfoPageLayout.jsx';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

export const CareersPage = () => {
  const [clickedJob, setClickedJob] = useState(null);

  const jobs = [
    { id: 1, title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time' },
    { id: 2, title: 'E-commerce Operations Manager', department: 'Operations', location: 'New York, NY', type: 'Full-time' },
    { id: 3, title: 'Customer Support Specialist', department: 'Support', location: 'Remote', type: 'Contract' },
    { id: 4, title: 'Product Designer (UI/UX)', department: 'Design', location: 'London, UK', type: 'Full-time' },
  ];

  return (
    <InfoPageLayout 
      title="Join the Cartify Team" 
      description="Help us build the future of online commerce. We are always looking for passionate, driven individuals."
    >
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
        <p className="text-gray-600 leading-relaxed">
          At Cartify, we are building a world-class marketplace. Our team enjoys flexible working hours, a remote-first culture, comprehensive health benefits, and the opportunity to make a massive impact on the e-commerce landscape.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
        
        <div className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="border border-gray-100 bg-gray-50 rounded-2xl p-6 transition-all hover:shadow-md hover:border-blue-100 group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><Briefcase size={16} /> {job.department}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Clock size={16} /> {job.type}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setClickedJob(job.id)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex-shrink-0"
              >
                {clickedJob === job.id ? 'Applications opening soon' : 'View Role'}
                {clickedJob !== job.id && <ArrowRight size={18} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
};

