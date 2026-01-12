import React from 'react';
import { BookData } from '../types';
import { TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from './ConfirmationModal';

interface BookFormProps {
  data: BookData;
  onChange: (field: keyof BookData, value: string | number) => void;
  onDelete?: (id: string) => void;
  onSave?: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ data, onChange, onDelete, onSave }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Book Title
            </label>
            <input
              type="text"
              id="title"
              value={data.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="e.g. The Great Gatsby"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black placeholder-neutral-400 dark:placeholder-neutral-600 focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all shadow-sm text-black dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentPage" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Current Page
              </label>
              <input
                type="number"
                id="currentPage"
                min="0"
                value={data.currentPage}
                onChange={(e) => onChange('currentPage', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black placeholder-neutral-400 dark:placeholder-neutral-600 focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all shadow-sm text-black dark:text-white outline-none"
              />
            </div>
            <div>
              <label htmlFor="totalPages" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Total Pages
              </label>
              <input
                type="number"
                id="totalPages"
                min="1"
                value={data.totalPages}
                onChange={(e) => onChange('totalPages', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black placeholder-neutral-400 dark:placeholder-neutral-600 focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all shadow-sm text-black dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="targetDate" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Goal Date
            </label>
            <input
              type="date"
              id="targetDate"
              value={data.targetDate}
              onChange={(e) => onChange('targetDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black placeholder-neutral-400 dark:placeholder-neutral-600 focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all shadow-sm text-black dark:text-white outline-none"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">Defaults to the end of the current month.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
          {onDelete && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          )}
          
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white px-6 py-2.5 rounded-lg font-bold transition-transform active:scale-95"
            >
              <CheckIcon className="w-4 h-4" />
              Save
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDelete && onDelete(data.id)}
        title="Delete Book"
        message={`Are you sure you want to remove "${data.title || 'this book'}" from your library?`}
      />
    </>
  );
};

export default BookForm;