import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  department_id: string;
  position_id: string;
  hire_date: string;
  salary: number;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'on-leave' | 'terminated' | 'suspended';
  emergency_contact_name: string;
  emergency_contact_phone: string;
  total_leave_days: number;
  used_leave_days: number;
  bank_account?: string;
  national_id?: string;
  notes?: string;
  departments?: {
    name: string;
    code: string;
  };
  employee_positions?: {
    title: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  manager_id?: string;
  budget: number;
  is_active: boolean;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid' | 'compassionate';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_at: string;
  employees?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export interface EmployeeLoan {
  id: string;
  employee_id: string;
  loan_amount: number;
  purpose: string;
  monthly_deduction: number;
  remaining_amount: number;
  start_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  employees?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export interface StaffRecognition {
  id: string;
  employee_id: string;
  recognition_type: 'employee_of_month' | 'achievement' | 'milestone' | 'customer_praise' | 'peer_nomination';
  title: string;
  description: string;
  month_year: string;
  votes: number;
  employees?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    departments?: {
      name: string;
    };
  };
}

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log('Fetching employees with secure access...');
      
      // Use secure function that properly masks sensitive data based on user permissions
      const { data, error } = await supabase.rpc('get_employee_data_secure');

      console.log('Secure employees query result:', { data, error });
      if (error) {
        console.error('Error fetching employees securely:', error);
        throw error;
      }

      // Transform data to include department and position info
      const employeesWithRelations = await Promise.all(
        (data || []).map(async (employee) => {
          const [deptResult, posResult] = await Promise.all([
            employee.department_id ? 
              supabase.from('departments').select('name, code').eq('id', employee.department_id).single() :
              Promise.resolve({ data: null }),
            employee.position_id ?
              supabase.from('employee_positions').select('title').eq('id', employee.position_id).single() :
              Promise.resolve({ data: null })
          ]);

          return {
            ...employee,
            departments: deptResult.data,
            employee_positions: posResult.data
          };
        })
      );

      return employeesWithRelations as Employee[];
    }
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Department[];
    }
  });
};

export const useLeaveRequests = () => {
  return useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employees!inner (first_name, last_name, employee_id)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });
};

export const useEmployeeLoans = () => {
  return useQuery({
    queryKey: ['employee-loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_loans')
        .select(`
          *,
          employees!inner (first_name, last_name, employee_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });
};

export const useStaffRecognition = () => {
  return useQuery({
    queryKey: ['staff-recognition'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_recognition')
        .select(`
          *,
          employees!inner (
            first_name, 
            last_name, 
            employee_id,
            departments!inner (name)
          )
        `)
        .eq('recognition_type', 'employee_of_month')
        .order('month_year', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });
};

export const useHRSummary = () => {
  return useQuery({
    queryKey: ['hr-summary'],
    queryFn: async () => {
      console.log('Fetching HR summary with secure access...');
      
      // Use secure function for employee data access
      const { data: employees, error: empError } = await supabase.rpc('get_employee_data_secure');

      console.log('HR Summary query result:', { employees, empError });
      if (empError) {
        console.error('Error fetching HR summary:', empError);
        throw empError;
      }

      const { data: leaves, error: leaveError } = await supabase
        .from('leave_requests')
        .select('status')
        .eq('status', 'pending');

      if (leaveError) throw leaveError;

      const { data: loans, error: loanError } = await supabase
        .from('employee_loans')
        .select('status')
        .eq('status', 'active');

      if (loanError) throw loanError;

      const total = employees?.length || 0;
      const active = employees?.filter(e => e.status === 'active').length || 0;
      const onLeave = employees?.filter(e => e.status === 'on-leave').length || 0;
      const pendingLeaves = leaves?.length || 0;
      const activeLoans = loans?.length || 0;
      
      // Only calculate total salary if user has financial access (salary will be null if masked)
      const totalSalaries = employees?.reduce((sum, e) => {
        return e.salary ? sum + Number(e.salary) : sum;
      }, 0) || 0;

      return {
        total,
        active,
        onLeave,
        pendingLeaves,
        activeLoans,
        totalSalaries
      };
    }
  });
};

export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: any) => {
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr-summary'] });
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr-summary'] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    },
  });
};

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', leaveId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: "Leave Approved",
        description: "Employee has been notified of the leave approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ leaveId, reason }: { leaveId: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          approved_at: new Date().toISOString()
        })
        .eq('id', leaveId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: "Leave Rejected",
        description: "Employee has been notified of the leave rejection.",
        variant: "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    },
  });
};

export const useAddLeaveRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leave: any) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([leave])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    },
  });
};