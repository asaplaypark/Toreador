import ActivityForm from "../ActivityForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminActivityCreatePage() {
  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/activities">
              <ArrowLeft className="mr-1 size-4" />
              กลับ
            </Link>
          </Button>
          <h1 className="text-xl font-medium text-charcoal">สร้างกิจกรรม</h1>
        </div>
        <ActivityForm />
      </div>
    </div>
  );
}
