import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Clubs from "@/pages/Clubs";
import ClubDetail from "@/pages/ClubDetail";
import Announcements from "@/pages/Announcements";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminEvents from "@/pages/AdminEvents";
import MyEvents from "@/pages/MyEvents";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      
      <Route path="/clubs" component={Clubs} />
      <Route path="/clubs/:id" component={ClubDetail} />
      
      <Route path="/announcements" component={Announcements} />
      
      {/* Protected Routes */}
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/my-events" component={MyEvents} />
      
      {/* Admin Routes */}
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/events" component={AdminEvents} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
