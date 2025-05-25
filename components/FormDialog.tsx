"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FormDialog({
  open,
  onOpenChange,
  title,
  formComponent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formComponent: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {formComponent}
      </DialogContent>
    </Dialog>
  );
}
