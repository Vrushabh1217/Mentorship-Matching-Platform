import React from 'react';
import { Profile } from '../types';

interface ProfileFormProps {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  error?: string;
  success?: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onProfileChange,
  onSubmit,
  error,
  success,
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Role</label>
        <select
          value={profile.role}
          onChange={(e) => onProfileChange({ ...profile, role: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select a role</option>
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Bio</label>
        <textarea
          value={profile.bio}
          onChange={(e) => onProfileChange({ ...profile, bio: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Skills (comma-separated)</label>
        <input
          type="text"
          value={profile.skills}
          onChange={(e) => onProfileChange({ ...profile, skills: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Interests (comma-separated)</label>
        <input
          type="text"
          value={profile.interests}
          onChange={(e) => onProfileChange({ ...profile, interests: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
      >
        Save Profile
      </button>
    </form>
  );
};