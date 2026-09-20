import { getExpenses } from "@/lib/db";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
  description: "Overview of your expenses.",
};

/**
 * DashboardPage is a Server Component. 
 * It handles fetching the initial data on the server without shipping JavaScript for the fetch logic to the client.
 */
export default async function DashboardPage() {
  const expenses = await getExpenses();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <DashboardCards expenses={expenses} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Your expense history visualization would go here.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed text-muted-foreground m-4">
              Chart Placeholder
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-4 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              You made {expenses.length} expenses this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentExpenses expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
