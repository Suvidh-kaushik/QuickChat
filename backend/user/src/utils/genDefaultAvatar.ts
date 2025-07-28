import { Gender } from "../model/userModel.js";

export const generateAvatarURL = (gender: Gender, username: string): string => {
  switch (gender) {
    case Gender.Male:
      return `https://avatar.iran.liara.run/public/boy?username=${username}`;
    case Gender.Female:
      return `https://avatar.iran.liara.run/public/girl?username=${username}`;
    case Gender.Other:
    default:
      return `https://robohash.org/${username}`;
  }
};
