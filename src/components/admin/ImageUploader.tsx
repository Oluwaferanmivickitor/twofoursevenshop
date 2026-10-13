import { useRef, useState } from "react";
import { Loader2, Upload, X, Star } from "lucide-react";
import { toast } from "sonner";
import { uploadProductImage } from "@/lib/products.functions";
import { fileToBase64 } from "@/lib/file-to-base64";
import { resolveImageUrl } from "@/lib/image-url";
import { Button } from "@/components/ui/button";
import { SortableList } from "./SortableList";
export function ImageUploader({value,onChange,multiple}:{value:string[];onChange:(urls:string[])=>void;multiple:boolean}){
 const input=useRef<HTMLInputElement>(null);const [uploading,setUploading]=useState(false);
 async function upload(files:FileList|null){if(!files?.length||uploading)return;setUploading(true);try{const urls:string[]=[];for(const file of Array.from(files)){if(!file.type.startsWith("image/")){toast.error("Choose an image file");continue;}if(file.size>10*1024*1024){toast.error(`${file.name} is larger than 10MB`);continue;}const result=await uploadProductImage({data:await fileToBase64(file)});urls.push(result.url);}if(urls.length)onChange(multiple?[...value,...urls]:urls.slice(-1));}catch(e){toast.error(`Upload failed: ${(e as Error).message}`);}finally{setUploading(false);if(input.current)input.current.value="";}}
 return <div className="space-y-4">{value.length>0&&<SortableList items={value.map((url,n)=>({id:`${n}-${url}`,url,n}))} onReorder={items=>onChange(items.map(i=>i.url))} render={item=><><div className="flex items-center gap-3"><img src={resolveImageUrl(item.url)} alt={`Product photo ${item.n+1}`} className="h-16 w-14 rounded-lg object-cover"/><Button type="button" variant="ghost" className={item.n===0?"text-primary":"text-muted-foreground"} aria-label={`Set photo ${item.n+1} as main image`} onClick={()=>onChange([item.url,...value.filter((_,i)=>i!==item.n)])}><Star size={16}/>{item.n===0?"Main":"Set main"}</Button></div><Button type="button" variant="ghost" size="icon" aria-label={`Remove photo ${item.n+1}`} onClick={()=>onChange(value.filter((_,i)=>i!==item.n))}><X size={16}/></Button></>}/>}
 <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files);}}><Button variant="outline" type="button" disabled={uploading} className="w-full min-h-24 border-dashed flex flex-col gap-2" onClick={()=>input.current?.click()}>{uploading?<Loader2 className="animate-spin" size={20}/>:<Upload size={20}/>}<span>{uploading?"Uploading…":multiple?"Upload photos":value.length?"Replace photo":"Upload photo"}</span><span className="text-xs text-muted-foreground">JPG, PNG, WebP · up to 10MB</span></Button></div><input ref={input} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={e=>upload(e.target.files)}/></div>;
}
