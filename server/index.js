import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const db = new Database("mentorship.db");
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(cors());
app.use(express.json());

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    skills TEXT,
    interests TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS mentorship_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_id INTEGER NOT NULL,
    mentee_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users (id),
    FOREIGN KEY (mentee_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    request_id INTEGER,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (request_id) REFERENCES mentorship_requests (id)
  );
`);

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Helper function to create notification
const createNotification = (userId, requestId, message, type) => {
    const stmt = db.prepare(`
        INSERT INTO notifications (user_id, request_id, message, type)
        VALUES (?, ?, ?, ?)
    `);
    return stmt.run(userId, requestId, message, type);
};

// Existing auth routes...
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare(
            "INSERT INTO users (email, password) VALUES (?, ?)"
        );
        const result = stmt.run(email, hashedPassword);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: "Email already exists" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token });
});

// Mentorship request routes
app.post("/api/mentorship-requests", authenticateToken, (req, res) => {
    const { mentorId } = req.body;
    const menteeId = req.user.id;

    const stmt = db.prepare(`
        INSERT INTO mentorship_requests (mentor_id, mentee_id)
        VALUES (?, ?)
    `);

    const result = stmt.run(mentorId, menteeId);

    // Create notification for mentor
    createNotification(
        mentorId,
        result.lastInsertRowid,
        "You have a new mentorship request",
        "request"
    );

    res.status(201).json({ id: result.lastInsertRowid });
});

// Accept mentorship request
app.put(
    "/api/mentorship-requests/:id/accept",
    authenticateToken,
    (req, res) => {
        try {
            const { id } = req.params;
            const mentorId = req.user.id;

            // Begin transaction
            const transaction = db.transaction(() => {
                // Update request status
                const updateStmt = db.prepare(`
                UPDATE mentorship_requests
                SET status = 'accepted'
                WHERE id = ? AND mentor_id = ?
            `);
                updateStmt.run(id, mentorId);

                // Get mentee_id
                const request = db
                    .prepare(
                        `
                SELECT mentee_id FROM mentorship_requests WHERE id = ?
            `
                    )
                    .get(id);

                // Create notification for mentee
                createNotification(
                    request.mentee_id,
                    id,
                    "Your mentorship request has been accepted",
                    "accepted"
                );

                // Delete the original request notification
                const deleteStmt = db.prepare(`
                DELETE FROM notifications
                WHERE request_id = ? AND user_id = ?
            `);
                deleteStmt.run(id, mentorId);
            });

            transaction();
            res.json({ message: "Request accepted successfully" });
        } catch (error) {
            console.error("Accept error:", error);
            res.status(500).json({ error: "Failed to accept request" });
        }
    }
);

// Decline mentorship request
app.put(
    "/api/mentorship-requests/:id/decline",
    authenticateToken,
    (req, res) => {
        try {
            const { id } = req.params;
            const mentorId = req.user.id;

            // Begin transaction
            const transaction = db.transaction(() => {
                // Update request status
                const updateStmt = db.prepare(`
                UPDATE mentorship_requests
                SET status = 'declined'
                WHERE id = ? AND mentor_id = ?
            `);
                updateStmt.run(id, mentorId);

                // Get mentee_id
                const request = db
                    .prepare(
                        `
                SELECT mentee_id FROM mentorship_requests WHERE id = ?
            `
                    )
                    .get(id);

                // Create notification for mentee
                createNotification(
                    request.mentee_id,
                    id,
                    "Your mentorship request has been declined",
                    "declined"
                );

                // Delete the original request notification
                const deleteStmt = db.prepare(`
                DELETE FROM notifications
                WHERE request_id = ? AND user_id = ?
            `);
                deleteStmt.run(id, mentorId);
            });

            transaction();
            res.json({ message: "Request declined successfully" });
        } catch (error) {
            console.error("Decline error:", error);
            res.status(500).json({ error: "Failed to decline request" });
        }
    }
);

// Update notifications route with error handling
app.get("/api/notifications", authenticateToken, (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT 
                n.id, 
                n.message, 
                n.type, 
                n.request_id,
                n.read,
                n.created_at,
                p.name, 
                p.role, 
                p.bio, 
                p.skills, 
                p.interests,
                mr.status as request_status
            FROM notifications n
            LEFT JOIN mentorship_requests mr ON n.request_id = mr.id
            LEFT JOIN profiles p ON (
                CASE 
                    WHEN mr.mentor_id = ? THEN p.user_id = mr.mentee_id
                    ELSE p.user_id = mr.mentor_id
                END
            )
            WHERE n.user_id = ? AND n.read = 0
            ORDER BY n.created_at DESC
        `);

        const notifications = stmt.all(req.user.id, req.user.id);

        // Ensure we're sending proper JSON response
        if (!notifications) {
            res.json([]);
            return;
        }

        // Format response to match frontend interface
        const formattedNotifications = notifications.map((n) => ({
            id: n.id,
            message: n.message,
            type: n.type,
            request_id: n.request_id,
            read: Boolean(n.read),
            created_at: n.created_at,
            name: n.name || "",
            role: n.role || "",
            bio: n.bio || "",
            skills: n.skills || "",
            interests: n.interests || "",
            request_status: n.request_status || "pending",
        }));

        res.json(formattedNotifications);
    } catch (error) {
        console.error("Notifications error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Mark notification as read (ignore)
app.put("/api/notifications/:id/read", authenticateToken, (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare(`
        UPDATE notifications
        SET read = 1
        WHERE id = ? AND user_id = ?
    `);

    stmt.run(id, req.user.id);
    res.json({ message: "Notification marked as read" });
});

// Update mentorship pairs route with error handling
app.get("/api/mentorship-pairs", authenticateToken, (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT 
                mr.id,
                mr.mentor_id,
                mr.mentee_id,
                mr.status,
                mr.created_at,
                p.name, 
                p.role, 
                p.bio, 
                p.skills, 
                p.interests,
                CASE 
                    WHEN mr.mentor_id = ? THEN 'mentor'
                    ELSE 'mentee'
                END as relationship_type
            FROM mentorship_requests mr
            JOIN profiles p ON (
                CASE 
                    WHEN mr.mentor_id = ? THEN mr.mentee_id
                    ELSE mr.mentor_id
                END = p.user_id
            )
            WHERE (mr.mentor_id = ? OR mr.mentee_id = ?)
            AND mr.status = 'accepted'
        `);

        const pairs = stmt.all(
            req.user.id,
            req.user.id,
            req.user.id,
            req.user.id
        );
        res.json(pairs || []);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update profile route with error handling
app.get("/api/profile", authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;

        const stmt = db.prepare(`
            SELECT p.id, p.role, p.name, p.bio, p.skills, p.interests, u.email 
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
        `);

        const profile = stmt.get(userId);

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update create/update profile route with error handling
app.post("/api/profiles", authenticateToken, (req, res) => {
    try {
        const { role, name, bio, skills, interests } = req.body;
        const userId = req.user.id;

        const existingProfile = db
            .prepare("SELECT id FROM profiles WHERE user_id = ?")
            .get(userId);

        if (existingProfile) {
            const stmt = db.prepare(`
                UPDATE profiles 
                SET role = ?, name = ?, bio = ?, skills = ?, interests = ?
                WHERE user_id = ?
            `);
            stmt.run(role, name, bio, skills, interests, userId);

            const updatedProfile = db
                .prepare("SELECT * FROM profiles WHERE id = ?")
                .get(existingProfile.id);

            res.json(updatedProfile);
        } else {
            const stmt = db.prepare(`
                INSERT INTO profiles (user_id, role, name, bio, skills, interests)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(userId, role, name, bio, skills, interests);

            const newProfile = db
                .prepare("SELECT * FROM profiles WHERE id = ?")
                .get(result.lastInsertRowid);

            res.status(201).json(newProfile);
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add this route to index.js
app.get("/api/profiles", authenticateToken, (req, res) => {
    try {
        // First get the user's profile to check their role
        const userProfile = db
            .prepare(
                `
            SELECT role FROM profiles WHERE user_id = ?
        `
            )
            .get(req.user.id);

        if (!userProfile) {
            return res.json([]);
        }

        // Get other profiles based on opposite role
        const stmt = db.prepare(`
            SELECT p.*, u.email
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id != ? 
            AND p.role = ?
        `);

        // If user is mentor, show mentees and vice versa
        const desiredRole = userProfile.role === "mentor" ? "mentee" : "mentor";
        const profiles = stmt.all(req.user.id, desiredRole);

        res.json(profiles || []);
    } catch (error) {
        console.error("Profiles error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Add this endpoint to index.js
app.put("/api/mentorship-requests/:id/end", authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Begin transaction
        const transaction = db.transaction(() => {
            // Update request status
            const updateStmt = db.prepare(`
                UPDATE mentorship_requests
                SET status = 'ended'
                WHERE id = ? AND (mentor_id = ? OR mentee_id = ?)
            `);
            updateStmt.run(id, userId, userId);

            // Get the other user's id (mentor or mentee)
            const request = db
                .prepare(
                    `
                SELECT mentor_id, mentee_id 
                FROM mentorship_requests 
                WHERE id = ?
            `
                )
                .get(id);

            const otherUserId =
                request.mentor_id === userId
                    ? request.mentee_id
                    : request.mentor_id;

            // Create notification for the other user
            createNotification(
                otherUserId,
                id,
                "Your mentorship relationship has ended",
                "ended"
            );
        });

        transaction();
        res.json({ message: "Mentorship ended successfully" });
    } catch (error) {
        console.error("End mentorship error:", error);
        res.status(500).json({ error: "Failed to end mentorship" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
