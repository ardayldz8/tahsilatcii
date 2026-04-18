import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px] rounded-lg bg-gray-100 animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function PanelDeepSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-14 rounded bg-gray-100 animate-pulse" />
            <div className="h-10 rounded bg-gray-100 animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
