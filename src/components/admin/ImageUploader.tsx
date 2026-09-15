import { useRef, useState } from "react";
import { Loader2, Upload, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadProductImage } from "@/lib/products.functions";
import { resolveImageUrl } from "@/lib/image-url";

export function ImageUploader({
  value,
  onChange,
  multiple,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB`);
          continue;
        }
        
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const res = reader.result as string;
            const base64 = res.includes(",") ? res.split(",")[1] : res;
            resolve(base64);
          };
          reader.onerror = (error) => reject(error);
        });

        // Passed directly as a clean flat object—no TanStack wrappers!
        const res = await uploadProductImage({
          filename: file.name,
          contentType: file.type || "image/jpeg",
          dataBase64: base64String,
        });

        uploaded.push(res.url);
      }

      if (uploaded.length === 0) return;
      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(-1));
    } catch (e) {
      toast.error(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary"
            >
              <img src={resolveImageUrl(url)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                aria-label="Remove image"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background px-4 py-6 text-center transition-colors hover:border-foreground"
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-foreground">
              {multiple ? "Upload images" : value.length > 0 ? "Replace image" : "Upload image"}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag files here or click to browse · PNG, JPG, WebP · up to 10MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
