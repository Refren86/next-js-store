// here will be handled all the sign in/sign out/auth check requests
import NextAuth from "next-auth";
import bcryptjs from 'bcryptjs';
import CredentialsProvider from "next-auth/providers/credentials";

import User from "../../../models/User";
import db from "../../../utils/db";

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // filling token with data from db
      if (user?._id) token._id = user._id; // creating token based on user id
      if (user?._isAdmin) token.isAdmin = user.isAdmin; // also store inside token admin user status

      return token;
    },
    async session({ session, token }) {
      // filling session with token data
      if (token?._id) session.user._id = token._id;
      if (token?.isAdmin) session.user.isAdmin = token.isAdmin;

      return session;
    },
  },
  providers: [
    // credentials provider for authenticating the user
    CredentialsProvider({
      async authorize(credentials) {
        await db.connect();

        const user = await User.findOne({
          email: credentials.email,
        });

        await db.disconnect();

        // check user and password (credentials.password - from frontend; user.password - from DB )
        if (user && bcryptjs.compareSync(credentials.password, user.password)) {
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: 'f', // currently no image
            isAdmin: user.isAdmin,
          };
        }

        throw new Error('Invalid email or password!');
      },
    }),
  ],
});