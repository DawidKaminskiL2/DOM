import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, LogIn, LogOut, Plus, Home } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Strona Główna', icon: Home },
    { path: '/add-book', label: 'Dodaj Książkę', icon: Plus },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto glass-card px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <BookOpen className="w-8 h-8 text-primary" />
          </motion.div>
          <span className="font-display text-xl font-bold gradient-text">
            LibraryLite
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium text-sm hidden sm:inline">{item.label}</span>
              </motion.div>
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="text-sm text-muted-foreground hidden md:inline">
                Witaj, <span className="text-primary font-medium">{username}</span>
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="btn-glass flex items-center gap-2 !px-4 !py-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Wyloguj</span>
              </motion.button>
            </div>
          ) : (
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2 !px-4 !py-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Zaloguj</span>
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
