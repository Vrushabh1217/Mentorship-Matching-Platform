// Discovery.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { Profile, Notification } from "../utils/api.ts";

const Discovery = () => {
    const { token } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [fetchedProfiles, fetchedNotifications] = await Promise.all([
                api.getProfiles(token!),
                api.getNotifications(token!),
            ]);

            setProfiles(fetchedProfiles || []);
            setNotifications(fetchedNotifications || []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load data"
            );
        } finally {
            setLoading(false);
        }
    };

    const sendMentorshipRequest = async (mentorId: number) => {
        try {
            setActionLoading(mentorId);
            await api.sendMentorshipRequest(token!, mentorId);
            await fetchData();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to send request"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleAction = async (actionFn: () => Promise<void>) => {
        try {
            await actionFn();
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
        }
    };

    const acceptRequest = async (requestId: number) => {
        try {
            setActionLoading(requestId);
            await api.acceptMentorshipRequest(token!, requestId);
            setSuccessMessage("Request accepted successfully!");
            await fetchData();
            setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3s
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to accept request"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const declineRequest = async (requestId: number) => {
        try {
            setActionLoading(requestId);
            await api.declineMentorshipRequest(token!, requestId);
            setSuccessMessage("Request declined successfully!");
            await fetchData();
            setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3s
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to decline request"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const ignoreNotification = async (notificationId: number) => {
        setActionLoading(notificationId);
        await handleAction(async () => {
            await api.ignoreNotification(token!, notificationId);
        });
        setActionLoading(null);
    };

    const filteredProfiles = profiles.filter(
        (profile) =>
            profile.name?.toLowerCase().includes(filter.toLowerCase()) ||
            profile.skills?.toLowerCase().includes(filter.toLowerCase()) ||
            profile.interests?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-8">
                Discover Mentors & Mentees
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {notifications.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4">Notifications</h3>
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="bg-white p-4 rounded-lg shadow-md"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-semibold">
                                            {notification.name}
                                        </h4>
                                        <p className="text-indigo-600">
                                            {notification.role}
                                        </p>
                                        <p className="text-gray-600 mt-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-600">
                                        {notification.bio}
                                    </p>
                                    {notification.skills && (
                                        <div className="mt-2">
                                            <h5 className="font-semibold">
                                                Skills:
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {notification.skills
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
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {notification.type === "request" &&
                                        !actionLoading && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        acceptRequest(
                                                            notification.request_id
                                                        )
                                                    }
                                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                                                    disabled={
                                                        actionLoading ===
                                                        notification.id
                                                    }
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        declineRequest(
                                                            notification.request_id
                                                        )
                                                    }
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                                    disabled={
                                                        actionLoading ===
                                                        notification.id
                                                    }
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                    <button
                                        onClick={() =>
                                            ignoreNotification(notification.id)
                                        }
                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                        disabled={
                                            actionLoading === notification.id
                                        }
                                    >
                                        Ignore
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name, skills, or interests..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                    <div
                        key={profile.id}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <h3 className="text-xl font-semibold mb-2">
                            {profile.name}
                        </h3>
                        <p className="text-indigo-600 mb-2">{profile.role}</p>
                        <p className="text-gray-600 mb-4">{profile.bio}</p>

                        <div className="mb-4">
                            <h4 className="font-semibold mb-1">Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills
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
                            <h4 className="font-semibold mb-1">Interests:</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests
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

                        <button
                            onClick={() => sendMentorshipRequest(profile.id!)}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                            disabled={actionLoading === profile.id}
                        >
                            {actionLoading
                                ? "Sending..."
                                : "Send Mentorship Request"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Discovery;
