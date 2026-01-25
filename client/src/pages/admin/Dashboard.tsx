import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Mail,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  AlertCircle,
  Upload,
  LogOut,
  Users,
  Layers,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function AdminDashboard() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const { user, canManageProperties, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("properties");
  
  const { data: properties = [], refetch: refetchProperties } = trpc.admin.properties.list.useQuery(undefined, {
    enabled: canManageProperties,
  });
  const { data: projects = [], refetch: refetchProjects } = trpc.projects.list.useQuery();
  const { data: inquiries = [] } = trpc.admin.inquiries.list.useQuery(undefined, {
    enabled: canManageProperties,
  });

  const deleteProperty = trpc.admin.properties.delete.useMutation({
    onSuccess: () => {
      refetchProperties();
      toast.success("Property deleted successfully");
    },
  });

  const deleteProject = trpc.admin.projects.delete.useMutation({
    onSuccess: () => {
      refetchProjects();
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  if (authLoading) {
    return <div className="container py-16 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to access the admin dashboard.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Sign In as Admin (Owner)</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/staff/login">Sign In as Staff</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canManageProperties) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Property management access is required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      await deleteProperty.mutateAsync({ id });
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      await deleteProject.mutateAsync({ id });
    }
  };

  const newInquiries = inquiries.filter(i => i.status === "new").length;

  const handleLogout = async () => {
    if (user.type === 'staff') {
      // Staff logout
      try {
        await fetch('/api/staff/logout', { method: 'POST' });
        toast.success('Logged out successfully');
        setLocation('/staff/login');
      } catch (error) {
        toast.error('Logout failed');
      }
    } else {
      // Admin OAuth logout
      window.location.href = '/api/oauth/logout';
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{user.type === 'staff' ? 'Property Management' : 'Admin Dashboard'}</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || (user.type === 'admin' ? user.email : user.username)}
          </p>
        </div>
        <div className="flex gap-2">
          {user.type === 'admin' && (
            <Button asChild variant="outline">
              <Link href="/admin/staff">
                <Users className="h-4 w-4 mr-2" />
                Manage Staff
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Properties</p>
                <p className="text-2xl sm:text-3xl font-bold">{properties.length}</p>
              </div>
              <Building2 className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl sm:text-3xl font-bold">{projects.length}</p>
              </div>
              <Layers className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {properties.filter(p => p.featured).length + projects.filter(p => p.featured).length}
                </p>
              </div>
              <Star className="h-10 w-10 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-2xl sm:text-3xl font-bold">{newInquiries}</p>
              </div>
              <Mail className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs - Properties and Projects side by side */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Property</span>
                <span className="sm:hidden">Properties</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Project</span>
                <span className="sm:hidden">Projects</span>
              </TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Button asChild variant="outline">
                  <Link href="/admin/properties/bulk-import">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/admin/properties/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Link>
                </Button>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground mb-4">No properties yet</p>
                  <Button asChild>
                    <Link href="/admin/properties/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Property
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      {property.imageUrl && (
                        <img
                          src={property.imageUrl}
                          alt={property.title}
                          className="w-20 h-20 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold truncate">{property.title}</h3>
                          {property.featured && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          {property.location} • {property.propertyType} • {property.status}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          ₹{Number(property.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/properties/${property.slug || property.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/properties/edit/${property.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(property.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Button asChild>
                  <Link href="/admin/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Link>
                </Button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Button asChild>
                    <Link href="/admin/projects/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Project
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      {project.coverImage ? (
                        <img
                          src={project.coverImage}
                          alt={project.name}
                          className="w-20 h-20 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                          <Layers className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold truncate">{project.name}</h3>
                          {project.featured && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                            project.status === 'Ready to Move' ? 'bg-green-100 text-green-700' :
                            project.status === 'Under Construction' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          {project.builderName} • {project.location}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {project.priceRange}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${project.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/projects/edit/${project.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Inquiries */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No inquiries yet</p>
          ) : (
            <div className="space-y-4">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{inquiry.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {inquiry.email} • {inquiry.phone}
                    </p>
                    <p className="text-sm mt-2 line-clamp-2">{inquiry.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                      inquiry.status === "new"
                        ? "bg-green-100 text-green-700"
                        : inquiry.status === "contacted"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
