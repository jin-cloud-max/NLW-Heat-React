import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
   id: string;
   name: string;
   login: string;
   avatar_url: string
}

type AuthContextData = {
   user: User | null;
   signInUrl: string;
   signOut: () => void
}

type AuthResponse = {
   token: string;
   user: {
      id: string;
      avatar_url: string;
      name: string;
      login: string;
   }
}

export const AuthContext = createContext({} as AuthContextData)

type AuthProvider = {
   children: ReactNode
}

export function AuthProvider({ children }: AuthProvider) {
   const [user, setUser] = useState<User | null>(null)

   const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=10b449b535f5a349db83`

   async function signIn(githubCode: string) {
      const response = await api.post<AuthResponse>("authenticate", {
         code: githubCode
      })

      const { token, user } = response.data

      localStorage.setItem("@dowhile:token", token)

      setUser(user)
   }

   useEffect(() => {
      const url = window.location.href
      const hasGithubCode = url.includes("?code=")

      if (hasGithubCode) {
         const [urlWithoutCode, githubCode] = url.split("?code=")

         window.history.pushState({}, '', urlWithoutCode)

         signIn(githubCode)
      }

   }, [])

   useEffect(() => {
      const token = localStorage.getItem('@dowhile:token')

      if (token) {
         api.defaults.headers.common.authorization = `Bearer ${token}`

         api.get<User>("users/profile").then(response => {
            setUser(response.data)
         })
      }
   }, [])

   function signOut() {
      setUser(null)

      localStorage.removeItem("@dowhile:token")
   }

   return (
      <AuthContext.Provider value={{ signInUrl, user, signOut }}>
         {children}
      </AuthContext.Provider>
   )
}