# SMP Chat — Features & Advantages

SMP Chat is a collaborative chat platform designed for mentors and students. It focuses on group collaboration, easy meeting coordination, and clear attendance tracking so teams can stay connected without losing context.

## Key features

### Messaging
- Real-time private and group chat with Socket.IO for instant messages and typing indicators.
- **Message reactions** — like/emoji-react to any message, broadcast live to all members.
- **Reply to messages** — reply previews render inline in the conversation.
- **Media sharing** — upload images, videos, and generic files directly in chat.
- **Unread counts & badges** — per-chat unread badges with a "99+" cap.
- **Online presence** — live online/offline status dots for direct chats (role-aware visibility).

### Collaboration & Administration
- Mentor roles and group administration (add/remove members, assign mentors).
- Schedule group meetings and attach a meeting time to each session.
- **Meeting reminders** — a banner in group chats and a calendar icon in the chat list highlight scheduled meetings.
- Attendance tracking per meeting with `present`, `absent`, and `pending` states.
- Push-style notifications for new messages and attendance changes.

### Auth & Profiles
- Simple user profiles, registration, and JWT-based authentication.
- Update profile (name, avatar, etc.).
- Modern split-screen **Sign In / Sign Up** pages with brand panel, password visibility toggle, and inline validation.

### UI/UX
- Modern glassmorphism UI with gradients, ambient background blobs, and smooth animations.
- Responsive chat layout that **fits the screen** — the chat list, messages, and input bar all fill the viewport without page scroll (flexbox-based).
- Shimmer loaders and refined loading states.

## Advantages

- Designed for small teams and classroom-style groups — focused on practical coordination rather than general social features.
- Reduces manual attendance overhead by tying attendance directly to scheduled meetings.
- Real-time updates keep all members in sync, so mentors don't need to refresh or poll the server.
- Clear role separation (mentor/student/admin) helps enforce permissions for scheduling and marking attendance.
- Interactive message reactions and reply threads improve communication clarity.
- Lightweight stack (Node/Express, MongoDB, React + Vite) that is easy to run locally or deploy.

## Tech Stack

- **Frontend:** React (Vite), Redux Toolkit, Tailwind CSS, Socket.IO client, React Router, React Toastify.
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT authentication.
- **Deployment:** Vercel-ready configs for both frontend and backend.

## Short note

This README focuses on what the project does and why it helps teams collaborate. If you want the installation and environment details moved into a separate `CONTRIBUTING.md` or `SETUP.md`, I can add that next.

## Author

Suresh Kumar
