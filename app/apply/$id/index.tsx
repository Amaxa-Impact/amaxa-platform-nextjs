import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/apply/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/apply/"!</div>;
}
