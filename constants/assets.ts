export const DEFAULT_AVATAR = "/img/default-avatar.png";

export const getInitialsAvatar = (name = "User") =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
