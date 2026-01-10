import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BookForm from '@/components/BookForm';
import { bookService, BookCreate } from '@/services/api';
import { toast } from 'sonner';
import { BookPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddBookPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: BookCreate) => {
    setIsLoading(true);
    try {
      await bookService.create(data);
      toast.success('Książka została dodana!');
      navigate('/');
    } catch (error) {
      toast.error('Nie udało się dodać książki');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Aurora blobs */}
      <div className="aurora-blob w-80 h-80 top-32 -right-20 animate-float" />
      <div className="aurora-blob w-64 h-64 bottom-20 left-10 animate-pulse-glow" />

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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <BookPlus className="w-8 h-8 text-primary-foreground" />
                </div>
              </motion.div>

              <h1 className="font-display text-2xl font-bold gradient-text">
                Dodaj Nową Książkę
              </h1>
              <p className="text-muted-foreground mt-2">
                Uzupełnij informacje o książce
              </p>
            </div>

            <BookForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Dodaj książkę"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBookPage;
