import { ORDER_STAGES, STAGE_LABELS, type OrderStage } from "@/lib/order-lifecycle";
export function OrderTimeline({ timestamps, stage, horizontal = false }: { timestamps: Record<string,string>; stage: OrderStage; horizontal?: boolean }) {
 return <ol className={`admin-timeline ${horizontal ? "horizontal" : ""}`}>{ORDER_STAGES.map(s=><li key={s} className={timestamps[s] || stage===s ? "done" : ""}><span>{s==="order_placed"?"Order placed":STAGE_LABELS[s]}</span><small>{timestamps[s] ? new Date(timestamps[s]).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : stage===s ? "Current stage" : "Pending"}</small></li>)}</ol>;
}
