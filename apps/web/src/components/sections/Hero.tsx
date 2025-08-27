'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.2))',
            'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(124, 58, 237, 0.2))',
            'linear-gradient(225deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.2))',
            'linear-gradient(315deg, rgba(6, 182, 212, 0.2), rgba(124, 58, 237, 0.2))',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(/textures/grid.svg)',
          backgroundSize: '100px 100px',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              className="text-5xl lg:text-7xl font-bold mb-6 text-accent-gradient bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Secure Document
              <br />
              <span className="text-slate-100">Verification</span>
            </motion.h1>

            <motion.p
              className="text-xl text-slate-300 mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Leverage blockchain technology to issue, verify, and manage digital credentials with unparalleled security and transparency.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                size="lg"
                className="bg-accent-gradient hover:opacity-90 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                onClick={() => scrollToSection('issue-section')}
              >
                Issue Credential
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-slate-600 text-slate-100 hover:bg-slate-800 font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                onClick={() => scrollToSection('verify-section')}
              >
                Verify Credential
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {/* Glowing card container */}
              <div className="glass p-8 rounded-2xl relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-accent-gradient opacity-20 blur-xl rounded-2xl" />
                
                {/* Hero image */}
                <div className="relative z-10">
                  <Image
                    src="/hero-verify.svg"
                    alt="Document Verification Illustration"
                    width={400}
                    height={300}
                    className="w-full h-auto"
                    priority
                  />
                </div>

                {/* Floating particles */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-accent-gradient rounded-full"
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute bottom-6 left-6 w-1 h-1 bg-cyan-400 rounded-full"
                  animate={{
                    y: [10, -10, 10],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-accent-gradient rounded-full mt-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;