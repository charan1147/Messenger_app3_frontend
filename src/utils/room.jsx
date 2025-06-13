export const getRoomId = (user1Id, user2Id) => {
  return [user1Id, user2Id].sort().join("_");
};
