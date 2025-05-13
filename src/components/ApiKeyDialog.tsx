
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAPIKey, setAPIKey } from "@/services/audioService";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKeyState] = useState(getAPIKey() || "");

  const handleSave = () => {
    if (apiKey.trim()) {
      setAPIKey(apiKey.trim());
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إعداد مفتاح API</DialogTitle>
          <DialogDescription>
            قم بإدخال مفتاح API الخاص بـ ElevenLabs للاستفادة من خدمة تحويل النص إلى كلام
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right col-span-1">
              مفتاح API
            </Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              placeholder="أدخل مفتاح API هنا"
              className="col-span-3"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            هذا المفتاح سيتم تخزينه محلياً فقط على جهازك
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
