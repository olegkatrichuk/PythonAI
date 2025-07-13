// frontend/src/app/components/AddToolForm.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { ITool, ICategory } from '@/types';
import { api } from '@/lib/api';

// 3. ИСПРАВЛЕНО: Убираем onToolAdded из пропсов. Форма больше не зависит от родителя.
interface AddToolFormProps {
  categories: ICategory[];
}

export default function AddToolForm({ categories }: AddToolFormProps) {
  const router = useRouter(); // <-- 4. ИСПРАВЛЕНО: Инициализируем роутер
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Для аутентифицированных запросов
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!categoryId) {
        toast.error('Пожалуйста, выберите категорию.');
        return;
    }

    // 6. ИСПРАВЛЕНО: Проверяем наличие токена перед отправкой
    if (!token) {
        toast.error('Для добавления инструмента необходимо войти в систему.');
        return;
    }

    const newToolData = {
        name,
        url,
        description,
        category_id: parseInt(categoryId)
    };

    await toast.promise(
        api.post('/api/tools/', newToolData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((response) => {
            // Данные были успешно отправлены
            // Очищаем все поля
            setName('');
            setUrl('');
            setDescription('');
            setCategoryId('');

            // Обновляем страницу
            router.refresh();
        }),
        {
            loading: 'Добавляем инструмент...',
            success: <b>Инструмент добавлен!</b>,
            error: (err) => <b>{err.message}</b>, // Показываем текст ошибки в toast
        }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-700 rounded-lg w-full max-w-lg bg-gray-800 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Добавить новый инструмент</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Название</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-300">URL</label>
          <input type="url" id="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300">Категория</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
            <option value="" disabled>Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Описание</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
          Добавить инструмент
        </button>
      </div>
    </form>
  );
}