import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStoreSettings, saveStoreSettings } from "@/lib/store.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function DeliveryThreshold(){const qc=useQueryClient();const q=useQuery({queryKey:["store-settings"],queryFn:()=>getStoreSettings()});const [draft,setDraft]=useState<string|null>(null),[busy,setBusy]=useState(false);return <form className="admin-card p-5" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await saveStoreSettings({data:{freeDeliveryThresholdNgn:Number(draft??q.data?.freeDeliveryThresholdNgn??0)}});toast.success("Delivery threshold saved");setDraft(null);qc.invalidateQueries({queryKey:["store-settings"]});}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}}><h2>Free delivery</h2><p className="text-muted-foreground text-sm mt-2 mb-5">Minimum order value. Set to 0 to keep delivery fees.</p><Label htmlFor="free-threshold">Threshold (₦)</Label><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 mt-3"><Input id="free-threshold" type="number" min={0} required value={draft??String(q.data?.freeDeliveryThresholdNgn??0)} onChange={e=>setDraft(e.target.value)}/><Button disabled={busy||q.isLoading}>{busy?"Saving…":"Save"}</Button></div>{q.error&&<p className="text-destructive mt-3">Could not load the delivery threshold.</p>}</form>;}
