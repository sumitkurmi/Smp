# SMP Chat — Features & Advantages

SMP Chat is a collaborative chat platform designed for mentors and students. It focuses on group collaboration, easy meeting coordination, and clear attendance tracking so teams can stay connected without losing context.

## Key features

- Real-time private and group chat with Socket.IO for instant messages and typing indicators.
- Mentor roles and group administration (add/remove members, assign mentors).
- Schedule group meetings and attach a meeting time to each session.
- Attendance tracking per meeting with `present`, `absent`, and `pending` states.
- Push-style notifications for new messages and attendance changes.
- Simple user profiles, registration, and JWT-based authentication.

## Advantages

- Designed for small teams and classroom-style groups — focused on practical coordination rather than general social features.
- Reduces manual attendance overhead by tying attendance directly to scheduled meetings.
- Real-time updates keep all members in sync, so mentors don't need to refresh or poll the server.
- Clear role separation (mentor/student/admin) helps enforce permissions for scheduling and marking attendance.
- Lightweight stack (Node/Express, MongoDB, React + Vite) that is easy to run locally or deploy.

## Short note

This README focuses on what the project does and why it helps teams collaborate. If you want the installation and environment details moved into a separate `CONTRIBUTING.md` or `SETUP.md`, I can add that next.

## Author

Suresh Kumar
