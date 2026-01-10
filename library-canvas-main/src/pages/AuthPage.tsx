import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api';
import { toast } from 'sonner';
import { BookOpen, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Nazwa użytkownika jest wymagana';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Minimum 3 znaki';
    }

    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Minimum 4 znaki';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGOWANIE ---
        
        // 1. Tworzymy token Basic Auth
        const token = btoa(`${formData.username}:${formData.password}`);

        // 2. Weryfikujemy hasło na serwerze (endpoint /verify)
        // WAŻNE: Ten adres musi pasować do Twojego endpointu w Pythonie
        const response = await fetch('http://localhost:8000/books/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // 3. Jeśli status to 401 (Unauthorized), hasło jest błędne
        if (response.status === 401) {
          throw new Error('Niepoprawna nazwa użytkownika lub hasło');
        }

        // Inne błędy serwera
        if (!response.ok) {
          throw new Error('Wystąpił błąd połączenia z serwerem');
        }

        // 4. Jeśli status 200 - logujemy w aplikacji
        login(formData.username, formData.password);
        toast.success('Zalogowano pomyślnie!');
        navigate('/');

      } else {
        // --- REJESTRACJA ---
        
        await authService.register(formData.username, formData.password);
        
        // Po udanej rejestracji od razu logujemy
        login(formData.username, formData.password);
        toast.success('Konto utworzone! Zostałeś zalogowany.');
        navigate('/');
      }
    } catch (error: any) {
      // Obsługa błędów
      if (error.message === 'Niepoprawna nazwa użytkownika lub hasło') {
        toast.error(error.message);
      } else {
        // Sprawdzamy, czy błąd pochodzi z axios (rejestracja) czy z fetch (logowanie)
        const detail = error.response?.data?.detail;
        if (detail) {
             toast.error(detail);
        } else {
             toast.error(error.message || 'Wystąpił nieoczekiwany błąd.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Aurora blobs */}
      <div className="aurora-blob w-96 h-96 top-20 -left-40 animate-float" />
      <div className="aurora-blob w-80 h-80 bottom-20 right-10 animate-pulse-glow" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-block relative mb-4"
              >
                <BookOpen className="w-12 h-12 text-primary" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-4 h-4 text-secondary" />
                </motion.div>
              </motion.div>

              <h1 className="font-display text-2xl font-bold gradient-text">
                {isLogin ? 'Witaj ponownie!' : 'Dołącz do nas!'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin
                  ? 'Zaloguj się do swojego konta'
                  : 'Stwórz nowe konto w LibraryLite'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 rounded-xl bg-muted/50 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                  isLogin
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Logowanie
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                  !isLogin
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Rejestracja
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nazwa użytkownika
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <motion.input
                        variants={inputVariants}
                        whileFocus="focus"
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="Twoja nazwa..."
                        className="glass-input pl-12"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-destructive text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hasło
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <motion.input
                        variants={inputVariants}
                        whileFocus="focus"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        className="glass-input pl-12"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password (Register only) */}
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Potwierdź hasło
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <motion.input
                          variants={inputVariants}
                          whileFocus="focus"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          className="glass-input pl-12"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <BookOpen className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;