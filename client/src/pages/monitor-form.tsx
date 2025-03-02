import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import { z } from "zod";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

interface Monitor {
  id: string;
  name: string;
  url: string;
  frequency: number;
}
const insertMonitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL"),
  frequency: z.number().min(1, "Frequency is required"),
});

const frequencies = [
  { value: 2, label: "2 minutes" },
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "60 minutes" },
];

export default function MonitorForm() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: monitor } = useQuery<Monitor>({
    queryKey: [`/api/monitors/${id}`],
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(insertMonitorSchema),
    defaultValues: {
      name: "",
      url: "",
      frequency: 5,
    },
    values: monitor,
  });

  const { mutate: saveMonitor, isPending } = useMutation({
    mutationFn: async (data: ReturnType<typeof form.getValues>) => {
      if (id) {
        return apiRequest("PUT", `/api/monitors/${id}`, data);
      }
      return apiRequest("POST", "/api/monitors", data);
    },
    onSuccess: () => {
      toast({
        title: id ? "Monitor updated" : "Monitor created",
        description: "Your changes have been saved successfully.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container py-8">
      <Link href="/" className="flex items-center space-x-2 mb-8 hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{id ? "Edit Monitor" : "Add Monitor"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveMonitor(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Frequency</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value.toString()}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Monitor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
