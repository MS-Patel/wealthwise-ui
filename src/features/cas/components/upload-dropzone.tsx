import { useCallback, useState } from "react";
import { Upload, FileCheck2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  onFileSelected: (file: File) => void;
  selected?: File | null;
  disabled?: boolean;
}

export function CASUploadDropzone({ onFileSelected, selected, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFileSelected(f);
    },
    [onFileSelected],
  );

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center transition",
        dragOver && "border-primary bg-primary/5",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelected(f);
        }}
      />
      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        {selected ? <FileCheck2 className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
      </div>
      {selected ? (
        <div>
          <p className="font-semibold">{selected.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selected.size / 1024).toFixed(0)} KB · ready to parse
          </p>
        </div>
      ) : (
        <div>
          <p className="font-semibold">Drop CAS PDF here, or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Supports CAMS / KFintech consolidated PDFs and NSDL / CDSL e-CAS
          </p>
        </div>
      )}
      <Button variant="outline" size="sm" type="button" className="gap-2" disabled={disabled}>
        {disabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        Choose file
      </Button>
    </label>
  );
}
