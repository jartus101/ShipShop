import { revalidateCurrentLocationData } from "@/services/app";
import { removeAuthedUserCookie } from "@/services/auth";
import { User } from "@/types/user"
import { create } from "zustand"

type Store = {
    user: null | User
    isLoggedIn: boolean;
    setAuth: (u: User) => void
    logout: () => void 
}

const useAuth = create<Store>((set) => ({
    user: null,
    isLoggedIn: false,
    setAuth: (u: User) => {
        set({ user: u, isLoggedIn: true })
        revalidateCurrentLocationData(location.pathname)
    },
    logout: async () => {
        set({ user: null, isLoggedIn: false })
        await removeAuthedUserCookie()
        location.reload()
    }
}))

export default useAuth
