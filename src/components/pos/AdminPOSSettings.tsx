import { useState } from "react";
import { Settings, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TableManagementModal } from "./TableManagementModal";

export function AdminPOSSettings() {
  const [open, setOpen] = useState(false);
  const [showTableManagement, setShowTableManagement] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Admin Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>POS Admin Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setShowTableManagement(true);
                setOpen(false);
              }}
            >
              <Building className="h-4 w-4 mr-2" />
              Manage Restaurant Tables
            </Button>
            
            <Button variant="outline" className="w-full justify-start" disabled>
              <User className="h-4 w-4 mr-2" />
              Staff Management (Coming Soon)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TableManagementModal 
        open={showTableManagement} 
        onOpenChange={setShowTableManagement} 
      />
    </>
  );
}