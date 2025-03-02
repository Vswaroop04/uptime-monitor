import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Activity, Plus, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { useState, useEffect } from "react";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";

function StatusBadge({ isUp }: { isUp: boolean }) {
  return (
    <div className={cn(
      "px-2 py-1 rounded-full text-xs font-medium",
      isUp ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    )}>
      {isUp ? "Up" : "Down"}
    </div>
  );
}

interface Monitor {
  id: string;
  name: string;
  url: string;
  frequency: number;
}

function MonitorCard({ monitor }: { monitor: Monitor }) {
  interface Status {
    isUp: boolean;
    responseTime: number;
  }

  const { data: statuses } = useQuery<Status[]>({
    queryKey: ["/api/monitors", monitor.id, "status"],
  });

  const lastStatus = statuses?.[0];
  const uptime = statuses ? 
    (statuses.filter(s => s.isUp).length / statuses.length) * 100 : 
    null;

  const [countdown, setCountdown] = useState(monitor.frequency * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : monitor.frequency * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [monitor.frequency]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{monitor.name}</span>
          {lastStatus && <StatusBadge isUp={lastStatus.isUp} />}
        </CardTitle>
        <p className="text-sm text-muted-foreground truncate">{monitor.url}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uptime</span>
            <span>{uptime ? `${uptime.toFixed(1)}%` : "N/A"}</span>
          </div>
          {lastStatus && (
            <div className="flex justify-between text-sm">
              <span>Response Time</span>
              <span>{lastStatus.responseTime}ms</span>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Next Check</span>
              <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
            </div>
            <Progress value={(countdown / (monitor.frequency * 60)) * 100} />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                apiRequest("POST", `/api/monitors/${monitor.id}/check`);
                setCountdown(monitor.frequency * 60);
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link href={`/monitors/${monitor.id}`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: monitors } = useQuery<Monitor[]>({
    queryKey: ["/api/monitors"],
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Uptime Monitor</h1>
        </div>
        <Link href="/monitors/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {monitors?.map((monitor) => (
          <MonitorCard key={monitor.id} monitor={monitor} />
        ))}
      </div>
    </div>
  );
}
