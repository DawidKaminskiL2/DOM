import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Book } from '@/services/api';
import { Pencil, Trash2, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  index: number;
  onDelete: (id: number) => void;
}

// 1. Owijamy komponent w forwardRef<HTMLDivElement, BookCardProps>
const BookCard = forwardRef<HTMLDivElement, BookCardProps>(({ book, index, onDelete }, ref) => {
  const { isAuthenticated } = useAuth();

  return (
    <motion.div
      ref={ref} // 2. Przekazujemy ref do głównego elementu motion.div
      layout // Opcjonalne: dodaje płynne przesuwanie innych kart, gdy jedna znika
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }} // Animacja wyjścia przy usuwaniu
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-card p-6 group relative overflow-hidden"
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-60" />
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <h3 className="font-display text-xl font-bold text-foreground mb-2 line-clamp-2">
          {book.title}
        </h3>
        
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <User className="w-4 h-4 text-secondary" />
          <span className="text-sm">{book.author}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-sm">{book.year}</span>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {book.description || 'Brak opisu...'}
        </p>

        {isAuthenticated && (
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <Link to={`/edit-book/${book.id}`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-glass !py-2 flex items-center justify-center gap-2 text-sm"
              >
                <Pencil className="w-4 h-4" />
                Edytuj
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(book.id)}
              className="flex-1 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Usuń
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Ważne dla debugowania w React DevTools
BookCard.displayName = "BookCard";

export default BookCard;