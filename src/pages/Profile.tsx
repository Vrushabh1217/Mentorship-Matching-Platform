// Profile.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Add this import
import { ProfileForm } from "../components/ProfileForm";
import { api } from "../utils/api";
import { Profile as ProfileType, MentorshipPair } from "../types";

const Profile = () => {
    const navigate = useNavigate(); // Add this hook
    const { token } = useAuth();
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [mentorshipPairs, setMentorshipPairs] = useState<MentorshipPair[]>(
        []
    );
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    // Update fetchData in Profile.tsx
    const fetchData = async () => {
        try {
            setLoading(true);
            const fetchedProfile = await api.getProfile(token!);
            setProfile(fetchedProfile);

            try {
                const pairs = await api.getMentorshipPairs(token!);
                setMentorshipPairs(pairs);
            } catch (err) {
                // Silently fail for mentorship pairs
                console.error("Failed to fetch mentorship pairs:", err);
            }
        } catch (err) {
            if (err instanceof Error && err.message === "Profile not found") {
                setProfile({
                    role: "",
                    name: "",
                    bio: "",
                    skills: "",
                    interests: "",
                });
            } else {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            if (!profile) return;
            await api.updateProfile(token!, profile);
            setSuccess("Profile updated successfully!");

            // Wait briefly to show success message then navigate
            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    // Add this handler function
    const endMentorship = async (pairId: number) => {
        if (!window.confirm("Are you sure you want to end this mentorship?")) {
            return;
        }

        try {
            await api.endMentorship(token!, pairId);
            setSuccess("Mentorship ended successfully");
            fetchData(); // Refresh the pairs list
            setTimeout(() => setSuccess(""), 3000); // Clear success message after 3s
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to end mentorship"
            );
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-8">
                {profile?.id ? "Your Profile" : "Create Your Profile"}
            </h2>

            <ProfileForm
                profile={profile}
                onProfileChange={setProfile}
                onSubmit={handleSubmit}
                error={error}
                success={success}
            />

            {mentorshipPairs.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">
                        Your Mentorship Connections
                    </h3>
                    <div className="space-y-4">
                        {mentorshipPairs.map((pair) => (
                            <div
                                key={pair.id}
                                className="bg-white p-4 rounded-lg shadow-md"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-semibold">
                                            {pair.name}
                                        </h4>
                                        <p className="text-indigo-600">
                                            {pair.relationship_type === "mentor"
                                                ? "Your Mentee"
                                                : "Your Mentor"}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                            Active
                                        </span>
                                        <button
                                            onClick={() =>
                                                endMentorship(pair.id)
                                            }
                                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                                        >
                                            End Mentorship
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4">{pair.bio}</p>

                                <div className="mb-4">
                                    <h4 className="font-semibold mb-1">
                                        Skills:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {pair.skills
                                            .split(",")
                                            .map((skill, index) => (
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
                                    <h4 className="font-semibold mb-1">
                                        Interests:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {pair.interests
                                            .split(",")
                                            .map((interest, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 px-2 py-1 rounded-md text-sm"
                                                >
                                                    {interest.trim()}
                                                </span>
                                            ))}
                                    </div>
                                </div>

                                <small className="text-gray-500">
                                    Connected since:{" "}
                                    {new Date(
                                        pair.created_at
                                    ).toLocaleDateString()}
                                </small>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
