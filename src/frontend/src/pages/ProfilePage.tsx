import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Variant_customer_professional } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerUserProfile,
  useCustomerProfile,
  useProfessionalProfile,
} from "../hooks/useQueries";
import { SERVICE_CATEGORIES } from "../lib/constants";

export default function ProfilePage() {
  const { data: userProfile, isLoading: profileLoading } =
    useCallerUserProfile();
  const { data: customerProfile } = useCustomerProfile();
  const { data: professionalProfile } = useProfessionalProfile();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    if (customerProfile?.addresses) {
      setAddresses(customerProfile.addresses);
    }
  }, [customerProfile]);

  const isCustomer =
    userProfile?.role === Variant_customer_professional.customer;
  const isProfessional =
    userProfile?.role === Variant_customer_professional.professional;
  const svcInfo = SERVICE_CATEGORIES.find(
    (c) => c.id === professionalProfile?.category,
  );

  const handleSaveAddresses = async () => {
    if (!actor) return;
    setIsSaving(true);
    try {
      await actor.updateCustomerProfile(addresses);
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
      toast.success("Addresses updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update addresses");
    } finally {
      setIsSaving(false);
    }
  };

  const addAddress = () => {
    if (newAddress.trim()) {
      setAddresses((prev) => [...prev, newAddress.trim()]);
      setNewAddress("");
    }
  };

  const removeAddress = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  if (profileLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <h1 className="text-2xl font-bold font-display">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information
        </p>
      </motion.div>

      {/* Basic Info Card */}
      <Card className="border border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">
                {userProfile?.name ??
                  customerProfile?.name ??
                  professionalProfile?.name ??
                  "User"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isCustomer
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isCustomer
                    ? "Customer"
                    : isProfessional
                      ? "Professional"
                      : "User"}
                </span>
                {isProfessional && svcInfo && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${svcInfo.iconBg} ${svcInfo.iconColor}`}
                  >
                    {svcInfo.icon} {svcInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>
                {userProfile?.phone ??
                  customerProfile?.phone ??
                  professionalProfile?.phone ??
                  "Not set"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-mono text-xs text-muted-foreground truncate max-w-xs">
                {identity?.getPrincipal().toString() ?? "Not connected"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      {isProfessional && professionalProfile && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm">
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {professionalProfile.bio && (
              <div>
                <Label className="text-xs text-muted-foreground">Bio</Label>
                <p className="mt-1">{professionalProfile.bio}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Working Radius
                </Label>
                <p className="mt-1 font-medium">
                  {Number(professionalProfile.workingRadius)} km
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <p
                  className={`mt-1 font-medium capitalize ${
                    professionalProfile.status === "approved"
                      ? "text-green-600"
                      : professionalProfile.status === "suspended"
                        ? "text-red-600"
                        : "text-amber-600"
                  }`}
                >
                  {professionalProfile.status}
                </p>
              </div>
            </div>
            {professionalProfile.subSkills.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {professionalProfile.subSkills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-accent rounded-full px-2 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Addresses (Customer only) */}
      {isCustomer && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Saved Addresses
              </CardTitle>
              {!isEditing ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-7 text-xs"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setAddresses(customerProfile?.addresses ?? []);
                    }}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAddresses}
                    disabled={isSaving}
                    className="h-7 text-xs bg-primary text-primary-foreground"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {addresses.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">
                No saved addresses. Add one below.
              </p>
            )}
            {addresses.map((addr, addressIndex) => (
              <div
                key={addr}
                className="flex items-start gap-2 text-sm p-2 bg-accent/30 rounded-lg"
              >
                <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="flex-1">{addr}</span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeAddress(addressIndex)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Add new address"
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addAddress()}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addAddress}
                  disabled={!newAddress.trim()}
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
