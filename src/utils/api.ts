const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  async register(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  async getProfiles(token: string) {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }
    return data;
  },

  async updateProfile(token: string, profile: any) {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return data;
  },

  async sendMentorshipRequest(token: string, mentorId: number) {
    const response = await fetch(`${API_BASE_URL}/mentorship-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ mentorId }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to send mentorship request');
    }
    return data;
  },
};