
import { ManageAccessForm } from "@/components/admin/users/ManageAccessForm";
import { getUserById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function ManageUserAccessPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to User List
            </Link>
        </Button>
        <header>
            <h1 className="text-3xl font-bold">Manage Access</h1>
            <p className="text-muted-foreground">Manage permissions for {user.name || user.email}.</p>
        </header>
        <Card>
            <CardContent className="pt-6">
                <ManageAccessForm user={user} />
            </CardContent>
        </Card>
    </div>
  )
}
