import { createFileRoute, Navigate } from "@tanstack/react-router";
import { adminHead } from "@/lib/admin-meta";
export const Route = createFileRoute("/admin")({ssr:false,head:()=>adminHead("Store"),component:AdminEntry});
function AdminEntry(){return <Navigate to="/admin/orders" replace/>;}
