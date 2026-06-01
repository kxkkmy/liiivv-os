import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProjectForm } from "@/components/management/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/management/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">プロジェクト作成</h1>
          <p className="text-sm text-muted-foreground mt-0.5">新しいプロジェクトを追加する</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">プロジェクト情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  );
}