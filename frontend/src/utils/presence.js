// Utility helpers for online presence & role checks

// A user is "online" only if they're in the online set.
export const isUserOnline = (userId, onlineUserIds = []) =>
  Boolean(userId) && onlineUserIds.includes(userId.toString());

// For a 1-on-1 chat, the other participant is the user to show presence for.
export const getOtherUser = (chat, authUserId) => {
  if (!chat?.users) return null;
  return chat.users.find((u) => u._id.toString() !== authUserId.toString()) || null;
};

// Mentors/admins can see online presence. Students cannot.
export const canSeePresence = (accountType) =>
  accountType === "mentor" || accountType === "admin";

