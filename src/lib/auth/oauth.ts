import { GitHub } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  "http://localhost:3000/api/login/github/callback",
);
