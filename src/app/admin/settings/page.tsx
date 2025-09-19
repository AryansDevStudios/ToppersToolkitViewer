
import { getSettings } from "@/lib/data";
import { Settings } from "lucide-react";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground">
          Manage general settings for the application.
        </p>
      </header>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
