"use client";
import { SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Bell, Calendar, Heart, Shield, Sparkles, Users } from "lucide-react";
import Image from "next/image";

const LandingPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const features = [
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never forget important moments with intelligent notifications"
    },
    {
      icon: Calendar,
      title: "Event Planning",
      description: "Organize and schedule events effortlessly"
    },
    {
      icon: Users,
      title: "Profile Management",
      description: "Manage multiple profiles and their special occasions"
    },
    {
      icon: Heart,
      title: "Personal Touch",
      description: "Add personal notes and memories to each reminder"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: Sparkles,
      title: "Beautiful Interface",
      description: "Enjoy a clean, modern design that's easy to use"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-900">
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-violet-200 dark:bg-violet-800 rounded-full opacity-20"
            variants={floatingVariants}
            animate="float"
          />
          <motion.div
            className="absolute top-40 right-20 w-16 h-16 bg-pink-200 dark:bg-pink-800 rounded-full opacity-20"
            variants={floatingVariants}
            animate="float"
            style={{ animationDelay: "1s" }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20"
            variants={floatingVariants}
            animate="float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo with animation */}
            <motion.div
              className="flex justify-center mb-8"
              variants={itemVariants}
            >
              <motion.div
                variants={pulseVariants}
                animate="pulse"
              >
                <Image
                  src="/nenapidu-logo.png"
                  alt="Nenapidu Logo"
                  width={300}
                  height={90}
                  className="h-20 w-auto"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              variants={itemVariants}
            >
              Never Miss a
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: "100% 50%" }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              >
                Special Moment
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Organize your life with intelligent reminders, beautiful profiles, and seamless event management. 
              Keep track of what matters most to you and your loved ones.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              variants={itemVariants}
              className="mb-16"
            >
              <SignInButton>
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-2xl hover:shadow-violet-500/25 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Free
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </SignInButton>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Nenapidu?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the features that make organizing your life effortless and enjoyable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        className="py-20 bg-gradient-to-r from-violet-600 to-pink-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Get Organized?
          </motion.h2>
          <motion.p
            className="text-xl text-violet-100 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of users who have transformed their lives with Nenapidu
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <SignInButton>
              <motion.button
                className="px-8 py-4 bg-white text-violet-600 text-lg font-semibold rounded-full shadow-2xl hover:bg-gray-50 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </motion.button>
            </SignInButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
