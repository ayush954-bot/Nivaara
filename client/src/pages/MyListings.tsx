import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Home,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Phone,
} from "lucide-react";
import PhoneOtpVerification from "@/components/PhoneOtpVerification";

type VerifiedSession = { phone: string; token: string };

function StatusBadge({ status }: { status: string | null }) {
  if (status === "published") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Published
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        <XCircle className="h-3 w-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
      <Clock className="h-3 w-3 mr-1" />
      Pending Review
    </Badge>
  );
}

function MyListingsContent({ verified }: { verified: VerifiedSession }) {
  const { data, isLoading } = trpc.publicListing.getMyListings.useQuery(
    { firebaseToken: verified.token },
    { retry: false }
  );

  const myProperties = data?.properties ?? [];
  const myProjects = data?.projects ?? [];
  const total = myProperties.length + myProjects.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading your listings...
      </div>
    );
  }

  if (total === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-16 text-center">
          <Home className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't submitted any properties or projects yet.
          </p>
          <Button asChild>
            <Link href="/list-property/submit">
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Listing
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5 inline mr-1" />
          Showing listings for <strong>{verified.phone}</strong>
        </p>
        <Button asChild size="sm">
          <Link href="/list-property/submit">
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Listing
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={myProperties.length > 0 ? "properties" : "projects"}>
        <TabsList className="mb-4">
          <TabsTrigger value="properties">
            Properties
            {myProperties.length > 0 && (
              <Badge variant="secondary" className="ml-2">{myProperties.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects
            {myProjects.length > 0 && (
              <Badge variant="secondary" className="ml-2">{myProjects.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {myProperties.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No property submissions yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myProperties.map((prop: any) => (
                <Card key={prop.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {prop.imageUrl && (
                      <div className="sm:w-40 h-36 sm:h-auto shrink-0">
                        <img
                          src={prop.imageUrl}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="flex-1 py-4 px-4 sm:px-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="font-semibold text-foreground">{prop.title}</h3>
                        </div>
                        <StatusBadge status={prop.listingStatus} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {prop.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3.5 w-3.5" />
                          ₹{Number(prop.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{prop.propertyType}</Badge>
                        <Badge variant="outline">{prop.status}</Badge>
                      </div>
                      {prop.listingStatus === "rejected" && prop.rejectionReason && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-100">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-red-700">Rejection reason:</p>
                            <p className="text-xs text-red-600 mt-0.5">{prop.rejectionReason}</p>
                          </div>
                        </div>
                      )}
                      {prop.listingStatus === "published" && (
                        <div className="mt-3 flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-100">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <p className="text-xs text-green-700">
                            Your property is live and visible to buyers on Nivaara.
                          </p>
                        </div>
                      )}
                      {prop.createdAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted {new Date(prop.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects">
          {myProjects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No project submissions yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myProjects.map((proj: any) => (
                <Card key={proj.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {proj.coverImage && (
                      <div className="sm:w-40 h-36 sm:h-auto shrink-0">
                        <img
                          src={proj.coverImage}
                          alt={proj.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="flex-1 py-4 px-4 sm:px-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="font-semibold text-foreground">{proj.name}</h3>
                        </div>
                        <StatusBadge status={proj.listingStatus} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {proj.location}, {proj.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {proj.builderName}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{proj.status}</Badge>
                        <Badge variant="outline">{proj.priceRange}</Badge>
                      </div>
                      {proj.listingStatus === "rejected" && proj.rejectionReason && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-100">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-red-700">Rejection reason:</p>
                            <p className="text-xs text-red-600 mt-0.5">{proj.rejectionReason}</p>
                          </div>
                        </div>
                      )}
                      {proj.listingStatus === "published" && (
                        <div className="mt-3 flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-100">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <p className="text-xs text-green-700">
                            Your project is live and visible to buyers on Nivaara.
                          </p>
                        </div>
                      )}
                      {proj.createdAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted {new Date(proj.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MyListings() {
  const [verified, setVerified] = useState<VerifiedSession | null>(null);

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Listings</h1>
        <p className="text-muted-foreground">
          Track the status of your property and project submissions. Verify your mobile number to view your listings.
        </p>
      </div>

      {!verified ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Verify Your Mobile Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the same mobile number you used when submitting your listing. We'll send a one-time OTP to confirm your identity.
            </p>
            <PhoneOtpVerification
              onVerified={(phone, token) => setVerified({ phone, token })}
            />
          </CardContent>
        </Card>
      ) : (
        <MyListingsContent verified={verified} />
      )}
    </div>
  );
}
