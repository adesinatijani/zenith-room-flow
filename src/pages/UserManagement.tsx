import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

interface UserRole {
  role: string;
}

const HOTEL_ROLES = [
  { value: 'admin', label: 'Administrator', color: 'bg-red-100 text-red-800' },
  { value: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-800' },
  { value: 'reception', label: 'Reception', color: 'bg-green-100 text-green-800' },
  { value: 'housekeeping', label: 'Housekeeper', color: 'bg-purple-100 text-purple-800' },
  { value: 'kitchen', label: 'Kitchen Staff', color: 'bg-orange-100 text-orange-800' },
  { value: 'bartender', label: 'Bartender', color: 'bg-pink-100 text-pink-800' },
  { value: 'supervisor', label: 'Supervisor', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'storekeeper', label: 'Store Keeper', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'accountclerk', label: 'Account Clerk', color: 'bg-teal-100 text-teal-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-100 text-gray-800' },
  { value: 'security', label: 'Security', color: 'bg-slate-100 text-slate-800' },
];

export default function UserManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: userRoles = {} } = useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (error) throw error;
      
      // Group roles by user_id
      const rolesMap: Record<string, string[]> = {};
      data.forEach((ur: any) => {
        if (!rolesMap[ur.user_id]) {
          rolesMap[ur.user_id] = [];
        }
        rolesMap[ur.user_id].push(ur.role);
      });
      
      return rolesMap;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData & { roles: string[] }) => {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      });

      if (authError) throw authError;

      // Update profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: userData.phone,
          department: userData.department,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Insert roles into user_roles table
      if (userData.roles.length > 0) {
        const roleInserts = userData.roles.map(role => ({
          user_id: authData.user.id,
          role: role as any
        }));

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(roleInserts);

        if (rolesError) throw rolesError;
      }

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, profileData, roles }: { id: string; profileData: Partial<Profile>; roles: string[] }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id);
      
      if (profileError) throw profileError;

      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', id);

      if (deleteError) throw deleteError;

      // Insert new roles
      if (roles.length > 0) {
        const roleInserts = roles.map(role => ({
          user_id: id,
          role: role as any
        }));

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(roleInserts);

        if (rolesError) throw rolesError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      setEditingUser(null);
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: 'Success',
        description: 'User status updated',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
    });
    setSelectedRoles([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRoles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one role',
        variant: 'destructive',
      });
      return;
    }

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        profileData: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          department: formData.department,
        },
        roles: selectedRoles
      });
    } else {
      createUserMutation.mutate({ ...formData, roles: selectedRoles });
    }
  };

  const startEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      email: '',
      password: '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      phone: user.phone || '',
      department: user.department || '',
    });
    setSelectedRoles(userRoles[user.id] || []);
    setIsDialogOpen(true);
  };

  const toggleRole = (roleValue: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleValue)
        ? prev.filter(r => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = HOTEL_ROLES.find(r => r.value === role);
    return (
      <Badge variant="secondary" className={roleConfig?.color}>
        {roleConfig?.label || role}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">You need administrator privileges to access user management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage hotel staff accounts and permissions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingUser(null); resetForm(); }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Create New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update user information and permissions' 
                  : 'Add a new staff member to the system'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {!editingUser && (
                <>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label>Roles (Select one or more)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {HOTEL_ROLES.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.value}
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={() => toggleRole(role.value)}
                      />
                      <label
                        htmlFor={role.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Front Office, Food & Beverage"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Members ({profiles.length})
          </CardTitle>
          <CardDescription>
            Manage hotel staff accounts, roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.first_name} {profile.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {userRoles[profile.id]?.map(role => getRoleBadge(role)) || <span className="text-muted-foreground">No roles</span>}
                    </div>
                  </TableCell>
                  <TableCell>{profile.department || '-'}</TableCell>
                  <TableCell>{profile.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={profile.is_active}
                        onCheckedChange={() => toggleUserStatus(profile.id, profile.is_active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {profiles.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No staff members yet</h3>
              <p className="text-muted-foreground mb-4">Start by creating user accounts for your hotel staff</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}