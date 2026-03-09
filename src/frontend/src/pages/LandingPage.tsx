import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, Shield, Star } from "lucide-react";
import { motion } from "motion/react";
import { SERVICE_CATEGORIES } from "../lib/constants";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-12 w-64 h-64 rounded-full bg-primary/20 blur-2xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-block bg-white/10 border border-white/20 text-white/90 text-sm font-medium px-3 py-1 rounded-full mb-5">
              Trusted by 10,000+ households
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 font-display">
              Book trusted home services{" "}
              <span className="text-primary/80 relative">
                on demand
                <motion.span
                  className="absolute bottom-0 left-0 h-1 bg-primary/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-lg text-white/75 mb-8 max-w-xl leading-relaxed">
              Connect with verified professionals for cooking, plumbing,
              carpentry, and pest control — right when you need them, at
              transparent prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 font-semibold text-base shadow-glow"
                onClick={onGetStarted}
              >
                Book a Service
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold text-base"
                onClick={onGetStarted}
              >
                Join as Professional
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 flex flex-wrap gap-6 text-sm text-white/70"
          >
            {[
              {
                icon: <CheckCircle className="w-4 h-4" />,
                text: "Verified professionals",
              },
              { icon: <Clock className="w-4 h-4" />, text: "Same-day service" },
              { icon: <Shield className="w-4 h-4" />, text: "Secure payments" },
              {
                icon: <Star className="w-4 h-4" />,
                text: "4.8★ average rating",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <span className="text-primary/80">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From daily cooking to emergency repairs — find the right
            professional for every home need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_CATEGORIES.map((service, index) => (
            <motion.div
              key={service.id}
              data-ocid={`home.service.card.${index + 1}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.45 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`${service.colorClass} rounded-2xl p-6 cursor-pointer shadow-card transition-shadow hover:shadow-glow group`}
              onClick={onGetStarted}
            >
              <div
                className={`w-14 h-14 ${service.iconBg} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                {service.icon}
              </div>
              <h3 className="text-lg font-bold mb-1 font-display">
                {service.label}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {service.subServices.slice(0, 2).map((sub) => (
                  <span
                    key={sub}
                    className="text-xs bg-white/60 rounded-full px-2 py-0.5 font-medium"
                  >
                    {sub}
                  </span>
                ))}
                <span className="text-xs bg-white/60 rounded-full px-2 py-0.5 font-medium">
                  +{service.subServices.length - 2} more
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-20 px-4 sm:px-6 bg-secondary/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
              How ServeNow Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Simple, fast, and reliable in 3 easy steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose & Book",
                desc: "Browse service categories, pick your preferred sub-service, and choose a date/time slot that works for you.",
                color: "text-primary",
              },
              {
                step: "02",
                title: "Professional Assigned",
                desc: "We instantly match you with a nearby verified professional who accepts your request in real-time.",
                color: "text-primary",
              },
              {
                step: "03",
                title: "Service & Review",
                desc: "Your professional arrives on time, completes the job, and you pay securely. Leave a review to help others.",
                color: "text-primary",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-6xl font-black font-display opacity-10 mb-3 leading-none">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2 font-display">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of happy customers and service professionals on
            ServeNow.
          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            onClick={onGetStarted}
          >
            Get Started — It's Free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
