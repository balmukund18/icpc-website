import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import {
  findOrCreateGoogleUser,
  GoogleProfile,
} from "../services/googleAuthService";
import { User } from "@prisma/client";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    "Warning: Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) are not configured. " +
      "Google authentication will not work until these are set in the environment.",
  );
}

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    (
      _req: any,
      _accessToken: string,
      _refreshToken: string,
      _params: any,
      profile: Profile,
      done: (err: Error | null, user?: User) => void,
    ) => {
      findOrCreateGoogleUser(profile as GoogleProfile)
        .then((user) => done(null, user))
        .catch((error) => done(error));
    },
  ),
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (userId: string, done) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.$disconnect();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
