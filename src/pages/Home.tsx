import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, MessageSquare } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Mentorship Match
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with mentors and mentees who share your interests and goals
        </p>
        <Link
          to="/register"
          className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
        >
          Get Started
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Users className="w-12 h-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
          <p className="text-gray-600">
            Connect with mentors or mentees based on shared interests and goals
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Target className="w-12 h-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Set Your Goals</h3>
          <p className="text-gray-600">
            Define your objectives and find someone who can help you achieve them
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <MessageSquare className="w-12 h-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
          <p className="text-gray-600">
            Begin your mentorship journey and grow together through meaningful connections
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;