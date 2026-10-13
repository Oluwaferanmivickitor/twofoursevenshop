import { createFileRoute, Link } from "@tanstack/react-router";
import { adminHead } from "@/lib/admin-meta";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeliveryThreshold } from "@/components/admin/DeliveryThreshold";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
export const Route=createFileRoute("/admin_/settings")({ssr:false,head:()=>adminHead("Store settings"),component:SettingsPage});
function SettingsPage(){return <AdminShell title="Store settings" description="The essentials behind your storefront."><div className="max-w-2xl"><DeliveryThreshold/><div className="admin-card p-6 mt-6"><h2>TwoFourSeven</h2><p className="text-muted-foreground mt-3">Currency · Nigerian naira (₦)</p><p className="text-muted-foreground mt-2">Payments · Bank transfer</p><Button asChild variant="outline" className="mt-5"><Link to="/">View store<ArrowUpRight size={18}/></Link></Button></div></div></AdminShell>;}
