// ProfileForm.tsx
import React, { useState } from "react";
import { Profile } from "../types";

interface ProfileFormProps {
    profile: Profile | null;
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!profile) {
        return (
            <div className="text-center py-4">
                <p>Loading profile...</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        setIsSubmitting(true);
        try {
            await onSubmit(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Role
                </label>
                <select
                    value={profile.role}
                    onChange={(e) =>
                        onProfileChange({ ...profile, role: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                >
                    <option value="">Select a role</option>
                    <option value="mentor">Mentor</option>
                    <option value="mentee">Mentee</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                        onProfileChange({ ...profile, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Bio
                </label>
                <textarea
                    value={profile.bio}
                    onChange={(e) =>
                        onProfileChange({ ...profile, bio: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Skills (comma-separated)
                </label>
                <input
                    type="text"
                    value={profile.skills}
                    onChange={(e) =>
                        onProfileChange({ ...profile, skills: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Interests (comma-separated)
                </label>
                <input
                    type="text"
                    value={profile.interests}
                    onChange={(e) =>
                        onProfileChange({
                            ...profile,
                            interests: e.target.value,
                        })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
                {isSubmitting ? "Saving..." : "Save Profile"}
            </button>
        </form>
    );
};
