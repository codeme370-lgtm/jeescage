import StoreLayout from "@/components/store/StoreLayout";

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

export default function RootAdminLayout({ children }) {
    return (
        <StoreLayout>
            {children}
        </StoreLayout>
    );
}
