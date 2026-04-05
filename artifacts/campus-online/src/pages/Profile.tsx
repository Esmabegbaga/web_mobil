import { useAuth } from "@/lib/auth";
import { useUpdateUser, useGetMe } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User as UserIcon, Building, Mail, Fingerprint, CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  department: z.string().optional(),
  avatarUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const updateMutation = useUpdateUser();
  const queryClient = useQueryClient();

  const { data: meData } = useGetMe({
    query: { queryKey: ['me'], enabled: !!user }
  });

  const displayUser = meData || user;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      department: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (displayUser) {
      form.reset({
        name: displayUser.name || "",
        department: displayUser.department || "",
        avatarUrl: displayUser.avatarUrl || "",
      });
    }
  }, [displayUser, form]);

  if (!displayUser) return null;

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const updated = await updateMutation.mutateAsync({ 
        id: displayUser.id, 
        data: values 
      });
      
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update profile.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-serif font-bold tracking-tight">Your Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Info */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 bg-primary/20"></div>
            <div className="px-6 pb-6 relative">
              <Avatar className="h-24 w-24 border-4 border-background absolute -top-12 bg-muted text-muted-foreground shadow-md">
                <AvatarImage src={displayUser.avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl font-serif font-bold bg-primary/10 text-primary">
                  {displayUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="pt-14 space-y-4">
                <div>
                  <h2 className="text-xl font-bold font-serif">{displayUser.name}</h2>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize mt-1 bg-primary/10 text-primary border-primary/20">
                    {displayUser.role.replace('_', ' ')}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary/60 shrink-0" />
                    <span className="truncate">{displayUser.email}</span>
                  </div>
                  {displayUser.studentId && (
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-4 w-4 text-primary/60 shrink-0" />
                      <span>ID: {displayUser.studentId}</span>
                    </div>
                  )}
                  {displayUser.department && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-primary/60 shrink-0" />
                      <span className="truncate">{displayUser.department}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-primary/60 shrink-0" />
                    <span>Joined {format(parseISO(displayUser.createdAt), "MMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Form */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information and how others see you.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department / Major</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
