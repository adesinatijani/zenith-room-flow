import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmployees } from "@/hooks/useHR";
import { useToast } from "@/hooks/use-toast";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { DollarSign, Users, Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ProcessPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProcessPayrollModal = ({ isOpen, onClose }: ProcessPayrollModalProps) => {
  const { toast } = useToast();
  const { data: employees = [] } = useEmployees();
  const { settings, formatCurrency } = useGlobalSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [payrollSettings, setPayrollSettings] = useState({
    payPeriod: new Date().toISOString().slice(0, 7), // Current month
    overtimeRate: 25,
    taxRate: settings.tax_rate || 7.5,
    generatePayslips: true,
    sendEmailNotifications: true
  });

  const activeEmployees = employees.filter(emp => emp.status === 'active');
  const totalSalaries = selectedEmployees.length > 0 
    ? employees.filter(emp => selectedEmployees.includes(emp.id)).reduce((sum, emp) => sum + emp.salary, 0)
    : activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);
  const monthlyPayroll = totalSalaries / 12;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(activeEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleEmployeeSelect = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Employees Selected",
        description: "Please select at least one employee to process payroll.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate payroll processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      toast({
        title: "Payroll Processed Successfully",
        description: `Monthly payroll for ${selectedEmployees.length} employees has been processed.`,
      });

      // Reset form
      setSelectedEmployees([]);
      setProgress(0);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payroll",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const employeesToProcess = selectedEmployees.length > 0 
    ? employees.filter(emp => selectedEmployees.includes(emp.id))
    : activeEmployees;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <DollarSign className="h-6 w-6" />
            Process Monthly Payroll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-medium">Processing Payroll...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Processing {selectedEmployees.length} employee payrolls. Please wait...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payPeriod">Pay Period</Label>
                    <Input
                      id="payPeriod"
                      type="month"
                      value={payrollSettings.payPeriod}
                      onChange={(e) => setPayrollSettings(prev => ({ ...prev, payPeriod: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overtimeRate">Overtime Rate ($)</Label>
                    <Input
                      id="overtimeRate"
                      type="number"
                      value={payrollSettings.overtimeRate}
                      onChange={(e) => setPayrollSettings(prev => ({ ...prev, overtimeRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={payrollSettings.taxRate}
                    onChange={(e) => setPayrollSettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generatePayslips"
                      checked={payrollSettings.generatePayslips}
                      onCheckedChange={(checked) => 
                        setPayrollSettings(prev => ({ ...prev, generatePayslips: !!checked }))
                      }
                    />
                    <Label htmlFor="generatePayslips">Generate Payslips</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmailNotifications"
                      checked={payrollSettings.sendEmailNotifications}
                      onCheckedChange={(checked) => 
                        setPayrollSettings(prev => ({ ...prev, sendEmailNotifications: !!checked }))
                      }
                    />
                    <Label htmlFor="sendEmailNotifications">Send Email Notifications</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Employees</span>
                    <span className="font-bold">{employeesToProcess.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Payroll</span>
                    <span className="font-bold">${totalSalaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Gross</span>
                    <span className="font-bold">${monthlyPayroll.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span className="font-bold text-warning">
                      ${(monthlyPayroll * payrollSettings.taxRate / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Estimated Net</span>
                    <span className="text-success">
                      ${(monthlyPayroll * (1 - payrollSettings.taxRate / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Selection
                </span>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedEmployees.length === activeEmployees.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="selectAll">Select All</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {activeEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={employee.id}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => handleEmployeeSelect(employee.id, !!checked)}
                      />
                      <div>
                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.employee_positions?.title} • {employee.departments?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${employee.salary.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">${(employee.salary / 12).toFixed(0)}/month</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayroll}
              disabled={isProcessing || selectedEmployees.length === 0}
              className="button-luxury flex items-center gap-2"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              <DollarSign className="h-4 w-4" />
              Process Payroll ({selectedEmployees.length || activeEmployees.length} Employees)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};