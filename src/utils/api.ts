const API_BASE_URL = "http://localhost:3000/api";

export interface Profile {
    id?: number;
    role: string;
    name: string;
    bio: string;
    skills: string;
    interests: string;
}

export interface Notification {
    id: number;
    message: string;
    type: string;
    request_id: number;
    read: boolean;
    created_at: string;
    name: string;
    role: string;
    bio: string;
    skills: string;
    interests: string;
    request_status: string;
}

export interface MentorshipPair {
    id: number;
    mentor_id: number;
    mentee_id: number;
    status: string;
    created_at: string;
    name: string;
    role: string;
    bio: string;
    skills: string;
    interests: string;
    relationship_type: "mentor" | "mentee";
}

export const api = {
    async register(email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Registration failed");
        }
        return data;
    },

    async login(email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }
        return data;
    },

    async getProfiles(token: string): Promise<Profile[]> {
        const response = await fetch(`${API_BASE_URL}/profiles`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch profiles");
        }
        return data || [];
    },

    async getProfile(token: string): Promise<Profile> {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (response.status === 404) {
            throw new Error("Profile not found");
        }
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch profile");
        }
        return data;
    },

    async updateProfile(token: string, profile: Profile): Promise<Profile> {
        const response = await fetch(`${API_BASE_URL}/profiles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profile),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to update profile");
        }
        return data;
    },

    async sendMentorshipRequest(token: string, mentorId: number) {
        const response = await fetch(`${API_BASE_URL}/mentorship-requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ mentorId }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to send mentorship request");
        }
        return data;
    },

    async getNotifications(token: string): Promise<Notification[]> {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch notifications");
        }
        return data || [];
    },

    async acceptMentorshipRequest(token: string, requestId: number) {
        const response = await fetch(
            `${API_BASE_URL}/mentorship-requests/${requestId}/accept`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to accept request");
        }
        return data;
    },

    async declineMentorshipRequest(token: string, requestId: number) {
        const response = await fetch(
            `${API_BASE_URL}/mentorship-requests/${requestId}/decline`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to decline request");
        }
        return data;
    },

    async ignoreNotification(token: string, notificationId: number) {
        const response = await fetch(
            `${API_BASE_URL}/notifications/${notificationId}/read`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to ignore notification");
        }
        return data;
    },

    async getMentorshipPairs(token: string): Promise<MentorshipPair[]> {
        const response = await fetch(`${API_BASE_URL}/mentorship-pairs`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch mentorship pairs");
        }
        return data || [];
    },

    async endMentorship(token: string, pairId: number) {
        const response = await fetch(
            `${API_BASE_URL}/mentorship-requests/${pairId}/end`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to end mentorship");
        }
        return data;
    },
};
