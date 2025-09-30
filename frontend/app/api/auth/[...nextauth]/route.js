import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

 export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Usuario hardcodeado
        const user = {
          id: 1,
          name: "Admin",
          username: "admin",
          password: "1234",
        };

        if (
          credentials.username === user.username &&
          credentials.password === user.password
        ) {
          return { id: user.id, name: user.name };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET ,
};
// integracion a mercado pago


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
