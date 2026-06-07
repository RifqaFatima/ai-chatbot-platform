import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",
    },
    pages: {
    signIn: "/login",
  },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {label: "Email", type: "email"},
                password: {label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password){
                    return null
                }

                const user = await db.user.findUnique({
                    where: {email: credentials.email},
                })

                if(!user || !user.password) {
                    return null
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if(!passwordMatch) return null

                return user
            },

        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },

        async session({ session, token }) {
            if(token) {
                session.user.role = token.role
                session.user.id = token.id
            }
            return session
        },
    },
}