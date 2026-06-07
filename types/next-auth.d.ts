//TypeScript declaration file that teaches TypeScript about the extra fields you're adding to the session and JWT.
import { Role } from "@prisma/client"
import NextAuth from "next-auth"

//module augmentation: extending predefined session interface in NextAuth module to include role and id
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            role: Role
        }
    }
//extending predefined user interface in NextAuth module to include role 
    interface User {
        role: Role
    }
}

//extending predefined JWT interface in NextAuth->jwt module to include role and id
declare module "next-auth/jwt"{
    interface JWT {
        role: Role
        id: string
    }
}