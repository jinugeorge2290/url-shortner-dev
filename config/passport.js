const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      try {
        const res = await pool.query(
          "INSERT INTO users (google_id, email) VALUES ($1, $2) ON CONFLICT (google_id) DO NOTHING RETURNING *",
          [profile.id, email]
        );
        done(null, res.rows[0] || { google_id: profile.id, email });
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.google_id);
});

passport.deserializeUser(async (id, done) => {
  const res = await pool.query("SELECT * FROM users WHERE google_id = $1", [
    id,
  ]);
  done(null, res.rows[0]);
});
