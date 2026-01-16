import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookCreate } from '@/services/api';
import { Book, Save } from 'lucide-react';

interface BookFormProps {
  initialData?: BookCreate;
  onSubmit: (data: BookCreate) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

const BookForm = ({ initialData, onSubmit, isLoading, submitLabel }: BookFormProps) => {
  const [formData, setFormData] = useState<BookCreate>({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookCreate, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookCreate, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tytuł jest wymagany';
    }
    if (!formData.author.trim()) {
      newErrors.author = 'Autor jest wymagany';
    }
    if (!formData.year || formData.year < 1000 || formData.year > new Date().getFullYear() + 10) {
      newErrors.year = 'Podaj prawidłowy rok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tytuł książki
        </label>
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Wprowadź tytuł..."
          className="glass-input"
        />
        {errors.title && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive text-sm mt-1"
          >
            {errors.title}
          </motion.p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Autor
        </label>
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Wprowadź autora..."
          className="glass-input"
        />
        {errors.author && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive text-sm mt-1"
          >
            {errors.author}
          </motion.p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Rok wydania
        </label>
        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
          placeholder="Rok wydania..."
          className="glass-input"
        />
        {errors.year && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive text-sm mt-1"
          >
            {errors.year}
          </motion.p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Opis
        </label>
        <motion.textarea
          variants={inputVariants}
          whileFocus="focus"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Krótki opis książki..."
          rows={4}
          className="glass-input resize-none"
        />
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Book className="w-5 h-5" />
          </motion.div>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {submitLabel}
          </>
        )}
      </motion.button>
    </motion.form>
  );
};

export default BookForm;
