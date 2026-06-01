import { redirect } from "next/navigation";

export const metadata = {
    title: "JeesCage. - Store Dashboard",
    description: "JeesCage. - Store Dashboard",
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        }
    }
};

export default function StoreLayoutRedirect({ children }) {
    redirect("/admin");
    return null;
}
