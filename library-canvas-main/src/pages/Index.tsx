import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/Hero';
import BookCard from '@/components/BookCard';
import Navbar from '@/components/Navbar';
import { bookService, Book } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BookOpen, Loader2, Search } from 'lucide-react';

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAuthHeader, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const data = await bookService.getAll();
      setBooks(data);
    } catch (error) {
      toast.error('Nie udało się pobrać listy książek');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      toast.error('Musisz być zalogowany, aby usunąć książkę');
      return;
    }

    try {
      await bookService.delete(id, authHeader);
      setBooks(books.filter((book) => book.id !== id));
      toast.success('Książka została usunięta');
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        toast.error('Brak autoryzacji. Sprawdź swoje dane logowania.');
      } else {
        toast.error('Nie udało się usunąć książki');
      }
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <Hero />

      {/* Books Section */}
      <section className="relative z-10 px-4 py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Kolekcja Książek</span>
          </h2>
          
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj po tytule lub autorze..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-12"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-primary" />
            </motion.div>
            <p className="text-muted-foreground mt-4">Ładowanie książek...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              {searchTerm ? 'Brak wyników' : 'Brak książek'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Spróbuj zmienić kryteria wyszukiwania'
                : 'Dodaj pierwszą książkę do kolekcji!'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isAuthenticated && books.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-muted-foreground mt-8"
          >
            💡 Zaloguj się, aby edytować lub usuwać książki
          </motion.p>
        )}
      </section>
    </div>
  );
};

export default Index;
