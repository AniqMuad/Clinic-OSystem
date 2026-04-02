import { useState } from "react";
import { useListTasks, useCompleteTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, AlertCircle } from "lucide-react";

export default function Tasks() {
  const [filter, setFilter] = useState("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasksResponse, isLoading } = useListTasks(
    { status: filter === "all" ? undefined : filter },
    { query: { queryKey: getListTasksQueryKey({ status: filter === "all" ? undefined : filter }) } }
  );

  const tasks = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse as any)?.tasks || [];
  const completeTask = useCompleteTask();

  const handleComplete = (id: number) => {
    completeTask.mutate(id, {
      onSuccess: () => {
        toast({ title: "Task completed" });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks & Workflow</h1>
          <p className="text-muted-foreground">Manage clinic preparation and daily tasks.</p>
        </div>
        <Button data-testid="button-add-task">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="mb-4 bg-white border">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>

        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)
          ) : tasks.length === 0 ? (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p>No tasks found in this category.</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task: any) => (
              <Card 
                key={task.id} 
                className={`transition-all ${task.status === 'completed' ? 'opacity-60 bg-muted/50' : 'hover:border-primary/50'}`}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="mt-1">
                    <Checkbox 
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleComplete(task.id)}
                      disabled={task.status === 'completed' || completeTask.isPending}
                      className="w-5 h-5 rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <Badge variant="outline" className={`capitalize text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
                      {task.dueTime && (
                        <div className={`flex items-center ${task.status === 'overdue' ? 'text-red-600 font-medium' : ''}`}>
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Due: {task.dueTime}
                        </div>
                      )}
                      {task.patientName && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1 text-foreground">Patient:</span> {task.patientName}
                        </div>
                      )}
                      {task.assignedToName && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1 text-foreground">Assignee:</span> {task.assignedToName}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}

// Just need CheckCircle2 icon that was used but not imported
import { CheckCircle2 } from "lucide-react";
