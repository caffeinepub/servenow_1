import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Loader2, User, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ServiceCategory,
  Variant_customer_professional,
} from "../backend";
import {
  useRegisterCustomer,
  useRegisterProfessional,
} from "../hooks/useQueries";
import { PROFESSIONAL_SUB_SKILLS, SERVICE_CATEGORIES } from "../lib/constants";

interface OnboardingPageProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [role, setRole] = useState<Variant_customer_professional | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [subSkills, setSubSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [workingRadius, setWorkingRadius] = useState("10");

  const registerCustomer = useRegisterCustomer();
  const registerProfessional = useRegisterProfessional();

  const isLoading =
    registerCustomer.isPending || registerProfessional.isPending;

  const toggleSkill = (skill: string) => {
    setSubSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (role === Variant_customer_professional.customer) {
        await registerCustomer.mutateAsync({
          name: name.trim(),
          phone: phone.trim(),
          addresses: address ? [address.trim()] : [],
        });
        toast.success("Welcome to ServeNow! Your account is ready.");
        onComplete();
      } else if (role === Variant_customer_professional.professional) {
        if (!category) {
          toast.error("Please select a service category");
          return;
        }
        await registerProfessional.mutateAsync({
          name: name.trim(),
          phone: phone.trim(),
          category: category as ServiceCategory,
          subSkills,
          bio: bio.trim(),
          workingRadius: BigInt(Number.parseInt(workingRadius) || 10),
        });
        toast.success(
          "Registration submitted! Our team will verify your profile shortly.",
        );
        onComplete();
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">
            Welcome to ServeNow
          </h1>
          <p className="text-muted-foreground">Let's set up your account</p>
        </div>

        <AnimatePresence mode="wait">
          {!role ? (
            <motion.div
              key="role-select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <p className="text-center text-sm font-medium text-muted-foreground mb-6">
                I want to join as...
              </p>
              <button
                type="button"
                data-ocid="onboarding.role.customer.button"
                onClick={() => setRole(Variant_customer_professional.customer)}
                className="w-full p-5 border-2 border-border rounded-xl flex items-center gap-4 hover:border-primary hover:bg-accent/50 transition-all group text-left"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-base font-display">
                    Customer
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Book home services near you
                  </div>
                </div>
                <ChevronRight className="ml-auto w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </button>
              <button
                type="button"
                data-ocid="onboarding.role.professional.button"
                onClick={() =>
                  setRole(Variant_customer_professional.professional)
                }
                className="w-full p-5 border-2 border-border rounded-xl flex items-center gap-4 hover:border-primary hover:bg-accent/50 transition-all group text-left"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-base font-display">
                    Service Professional
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Earn by offering your skills
                  </div>
                </div>
                <ChevronRight className="ml-auto w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="profile-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm font-medium capitalize">
                  {role === Variant_customer_professional.customer
                    ? "Customer"
                    : "Professional"}{" "}
                  Profile
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  data-ocid="onboarding.name.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  data-ocid="onboarding.phone.input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  type="tel"
                  required
                />
              </div>

              {role === Variant_customer_professional.customer && (
                <div className="space-y-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              )}

              {role === Variant_customer_professional.professional && (
                <>
                  <div className="space-y-2">
                    <Label>Service Category *</Label>
                    <Select
                      value={category}
                      onValueChange={(v) => {
                        setCategory(v as ServiceCategory);
                        setSubSkills([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your speciality" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.icon} {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {category && (
                    <div className="space-y-2">
                      <Label>Sub-Skills (select all that apply)</Label>
                      <div className="flex flex-wrap gap-2">
                        {(PROFESSIONAL_SUB_SKILLS[category] ?? []).map(
                          (skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`text-sm px-3 py-1 rounded-full border transition-all ${
                                subSkills.includes(skill)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border hover:border-primary hover:bg-accent"
                              }`}
                            >
                              {skill}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / About</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell customers about your experience and skills..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radius">Working Radius (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      min="1"
                      max="50"
                      value={workingRadius}
                      onChange={(e) => setWorkingRadius(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                data-ocid="onboarding.submit_button"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                size="lg"
              >
                {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
