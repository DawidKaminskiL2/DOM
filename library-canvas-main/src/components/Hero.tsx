import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24">
      {/* Aurora blobs */}
      <div className="aurora-blob w-96 h-96 -top-20 -left-20 animate-float" />
      <div className="aurora-blob w-80 h-80 top-40 right-10 animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="aurora-blob w-64 h-64 bottom-10 left-1/3 animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <BookOpen className="w-20 h-20 text-primary" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-secondary" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="gradient-text">Twoja Biblioteka</span>
          <br />
          
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/add-book">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg"
            >
              Dodaj Książkę
            </motion.button>
          </Link>
          
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
