
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Products</CardTitle>
            <CardDescription>Add, edit, and view products.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Navigate to the products page to manage inventory.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Staff</CardTitle>
            <CardDescription>
              Create and manage staff accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Navigate to the staff page to manage users.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>View and manage generated invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Navigate to the invoices page to view past invoices.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
