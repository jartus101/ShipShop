"use server"

import { revalidatePath } from "next/cache";

export async function revalidateCurrentLocationData(location: string)  {
    revalidatePath(location, "layout")    
}