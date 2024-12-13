import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Profile {
  id: number;
  name: string;
  role: string;
  bio: string;
  skills: string;
  interests: string;
}

const Discovery = () => {
  const { token } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const sendMentorshipRequest = async (mentorId: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/mentorship-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send mentorship request');
      }

      alert('Mentorship request sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(filter.toLowerCase()) ||
    profile.skills.toLowerCase().includes(filter.toLowerCase()) ||
    profile.interests.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Discover Mentors & Mentees</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, skills, or interests..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
            <p className="text-indigo-600 mb-2">{profile.role}</p>
            <p className="text-gray-600 mb-4">{profile.bio}</p>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-md text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-1">Interests:</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.split(',').map((interest, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-md text-sm"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => sendMentorshipRequest(profile.id)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              Send Mentorship Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discovery;