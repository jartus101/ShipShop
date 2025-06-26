"use server";
import { redirect } from 'next/navigation';

export async function searchAction(form: FormData) {
    const value = form.get("query");
    redirect(`/search/${value}`);
}
