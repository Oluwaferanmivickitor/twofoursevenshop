import { PackageOpen } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

export function AdminEmpty({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="admin-empty"><PackageOpen size={32} className="text-primary" /><h2>{title}</h2><p>{detail}</p>{action}</div>;
}
export function AdminLoading() { return <div className="grid gap-4">{[1,2,3].map(n => <Skeleton key={n} className="h-36 w-full rounded-2xl" />)}</div>; }
export function AdminPanel({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
  return <Dialog open onOpenChange={o => !o && onClose()}><DialogContent className="admin-theme admin-panel"><div className="admin-panel-heading"><DialogTitle>{title}</DialogTitle><DialogDescription>{description ?? "TwoFourSeven Studio"}</DialogDescription></div>{children}</DialogContent></Dialog>;
}
export function ConfirmAction({ title, description, onConfirm, onClose, busy = false }: { title: string; description: string; onConfirm: () => void; onClose: () => void; busy?: boolean }) {
  return <Dialog open onOpenChange={o => !o && onClose()}><DialogContent className="admin-theme admin-confirm"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription><div className="flex gap-3 justify-end"><Button variant="outline" onClick={onClose}>Go back</Button><Button variant="destructive" disabled={busy} onClick={onConfirm}>{busy ? "Saving…" : "Confirm"}</Button></div></DialogContent></Dialog>;
}