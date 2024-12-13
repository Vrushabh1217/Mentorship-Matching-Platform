import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileForm } from '../components/ProfileForm';
import { api } from '../utils/api';
import { Profile as ProfileType } from '../types';

const Profile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfileType>({
    role: '',
    name: '',
    bio: '',
    skills: '',
    interests: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.updateProfile(token!, profile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Your Profile</h2>
      <ProfileForm
        profile={profile}
        onProfileChange={setProfile}
        onSubmit={handleSubmit}
        error={error}
        success={success}
      />
    </div>
  );
};

export default Profile;