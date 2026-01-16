import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BookForm from '@/components/BookForm';
import { bookService, BookCreate, Book } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Pencil, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const EditBookPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { getAuthHeader, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Musisz być zalogowany, aby edytować książkę');
      navigate('/auth');
      return;
    }

    fetchBook();
  }, [id, isAuthenticated]);

  const fetchBook = async () => {
    if (!id) return;

    try {
      const data = await bookService.getOne(parseInt(id));
      setBook(data);
    } catch (error) {
      toast.error('Nie znaleziono książki');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: BookCreate) => {
    if (!id) return;

    const authHeader = getAuthHeader();
    if (!authHeader) {
      toast.error('Musisz być zalogowany, aby edytować książkę');
      return;
    }

    setIsSaving(true);
    try {
      await bookService.update(parseInt(id), data, authHeader);
      toast.success('Książka została zaktualizowana!');
      navigate('/');
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        toast.error('Brak autoryzacji. Sprawdź swoje dane logowania.');
      } else {
        toast.error('Nie udało się zaktualizować książki');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-12 h-12 text-primary" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Aurora blobs */}
      <div className="aurora-blob w-80 h-80 top-32 -left-20 animate-float" />
      <div className="aurora-blob w-64 h-64 bottom-20 right-10 animate-pulse-glow" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Link to="/">
            <motion.button
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Powrót do biblioteki
            </motion.button>
          </Link>

          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-block mb-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <Pencil className="w-8 h-8 text-secondary-foreground" />
                </div>
              </motion.div>

              <h1 className="font-display text-2xl font-bold gradient-text">
                Edytuj Książkę
              </h1>
              <p className="text-muted-foreground mt-2">
                Zaktualizuj informacje o książce
              </p>
            </div>

            {book && (
              <BookForm
                initialData={{
                  title: book.title,
                  author: book.author,
                  year: book.year,
                  description: book.description,
                }}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                submitLabel="Zapisz zmiany"
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditBookPage;
