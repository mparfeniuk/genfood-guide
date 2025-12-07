"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Upload, FileIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onFileSelected: (file: File) => void;
  label: string;
  hint: string;
  chooseFileLabel: string;
  dropLabel: string;
  sampleCta: string;
  onUseSample: () => void;
  selectedFileName?: string;
};

export function UploadCSV({
  onFileSelected,
  label,
  hint,
  chooseFileLabel,
  dropLabel,
  sampleCta,
  onUseSample,
  selectedFileName,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    if (file.type && file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return;
    }
    onFileSelected(file);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <CardHeader className="gap-1">
        <CardTitle className="text-xl">{label}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr,auto] items-end">
          <div className="space-y-2">
            <Label htmlFor="file-upload">{chooseFileLabel}</Label>
            <Label
              htmlFor="file-upload"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition hover:border-primary/70 hover:bg-muted ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <Upload className="h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">
                {dropLabel}
              </p>
              {selectedFileName ? (
                <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  <FileIcon className="h-4 w-4" />
                  <span className="truncate max-w-[220px]">{selectedFileName}</span>
                </div>
              ) : null}
            </Label>
            <Input
              ref={inputRef}
              id="file-upload"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => inputRef.current?.click()}>
              {chooseFileLabel}
            </Button>
            <Button type="button" variant="outline" onClick={onUseSample}>
              {sampleCta}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


