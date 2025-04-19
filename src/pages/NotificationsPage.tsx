
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const NotificationsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Notifications</h1>
          
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-edu-primary/10 p-2 rounded-full">
                  <Bell className="h-6 w-6 text-edu-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">No new notifications</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
