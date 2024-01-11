import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import GoogleProvider from 'next-auth/providers/google'
import NextAuth, { getServerSession } from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials";
import { mongooseConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import { UserInfo } from "@/models/UserInfo";

export const authOptions = {
    secret: process.env.SECRET,
    providers: [
        // OAuth authentication providers...
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
        CredentialsProvider({
            name: 'my-credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                const email = credentials?.email;
                const password = credentials?.password;
                await mongooseConnect();
                const userInfo = await UserInfo.findOne({ email });
                if (userInfo?.role === 'admin') {
                    const user = await User.findOne({ email });
                    if (user && bcrypt.compareSync(password, user.password)) {
                        return user;
                    }
                }
                return null;
            },
        },
        ),
    ],
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
        async jwt({ token, user }) {
            if (user?._id) token._id = user._id;
            if (user?.role === 'admin') token.role = user.role;
            return token;
        },
        async session({ session, token }) {
            if (token?._id) session.user._id = token._id;
            if (token?.role === 'admin') session.user.role = token.role;
            return session;
        },
        async signIn({ account, profile }) {
            if (account?.provider === 'google') {
                await mongooseConnect();
                const userInfo = await UserInfo.findOne({ email: profile.email });
                if (userInfo?.role !== 'admin') {
                    return false;
                }
            }
            return true;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
    const session = await getServerSession(req, res, authOptions)
    await mongooseConnect();
    const userInfo = await UserInfo.findOne({ email: session?.user?.email });
    if (userInfo?.role !== 'admin') {
        res.status(401);
        res.end()
        throw new Error('Unauthorized');
    }
}