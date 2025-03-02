import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";
import { useLocation } from "wouter";

export function ProtectedRoute({
  component: Component,
  ...rest
}: {
  path?: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  if (isLoading) {
    return (
      <Route {...rest}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return <Route {...rest} component={Component} />;
}
