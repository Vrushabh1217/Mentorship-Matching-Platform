// index.ts

export interface Profile {
    id?: number;
    role: string;
    name: string;
    bio: string;
    skills: string;
    interests: string;
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

export interface AuthResponse {
    token: string;
}

export interface ApiError {
    error: string;
}
