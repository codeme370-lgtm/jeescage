import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "jeesCage. - Admin",
    description: "jeesCage. - Admin",
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
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
