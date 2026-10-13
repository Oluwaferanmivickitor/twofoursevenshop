import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
function Row({id,children}:{id:string;children:ReactNode}){const {attributes,listeners,setNodeRef,transform,transition}=useSortable({id});return <div ref={setNodeRef} style={{transform:CSS.Transform.toString(transform),transition}} className="admin-card admin-reorder-row"><Button variant="ghost" size="icon" className="admin-drag-handle" aria-label="Drag to reorder" {...attributes} {...listeners}><GripVertical size={18}/></Button>{children}</div>;}
export function SortableList<T extends {id:string}>({items,onReorder,render}:{items:T[];onReorder:(items:T[])=>void;render:(item:T)=>ReactNode}){
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 function end(e:DragEndEvent){if(e.over&&e.active.id!==e.over.id){const from=items.findIndex(i=>i.id===e.active.id),to=items.findIndex(i=>i.id===e.over?.id);if(from>=0&&to>=0)onReorder(arrayMove(items,from,to));}}
 return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}><SortableContext items={items.map(i=>i.id)} strategy={verticalListSortingStrategy}>{items.map(item=><Row key={item.id} id={item.id}>{render(item)}</Row>)}</SortableContext></DndContext>;
}
