// Путь: frontend/src/app/admin/categories/page.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
// 1. ИМПОРТИРУЕМ НАШ НОВЫЙ КОМПОНЕНТ
import ConfirmationDialog from '../../../../components/ConfirmationDialog';

interface Category {
  id: number;
  name: string;
}

export default function CategoryManagerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: number | null; name: string }>({ id: null, name: '' });

  // 2. НОВОЕ СОСТОЯНИЕ ДЛЯ УПРАВЛЕНИЯ ДИАЛОГОМ
  const [deletionTargetId, setDeletionTargetId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`);
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
      toast.error("Не удалось загрузить список категорий.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Произошла ошибка');
        }
        const newCategory: Category = await response.json();
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        return newCategory;
      }),
      {
        loading: 'Добавляем категорию...',
        success: <b>Категория добавлена!</b>,
        error: (err) => <b>{err.toString()}</b>,
      }
    );
  };

  const handleUpdateCategory = async (e: FormEvent) => {
      e.preventDefault();
      if (!editingCategory.id || !editingCategory.name.trim()) return;

      await toast.promise(
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingCategory.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editingCategory.name }),
        }).then(async response => {
            if (!response.ok) throw new Error('Ошибка при обновлении');
            const updatedCategory: Category = await response.json();
            setCategories(categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
            setEditingCategory({ id: null, name: '' });
        }),
        {
            loading: 'Сохранение...',
            success: <b>Категория обновлена!</b>,
            error: <b>Не удалось обновить категорию.</b>,
        }
      );
  }

  // 3. ОБНОВЛЕННАЯ ЛОГИКА УДАЛЕНИЯ

  // Эта функция просто открывает диалог, запоминая, что мы хотим удалить
  const requestDeleteCategory = (categoryId: number) => {
    setDeletionTargetId(categoryId);
  };

  // Эта функция будет вызвана при подтверждении в диалоговом окне
  const confirmDeleteCategory = async () => {
    if (deletionTargetId === null) return;

    await toast.promise(
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${deletionTargetId}`, {
            method: 'DELETE',
        }).then(response => {
            if (!response.ok) throw new Error('Ошибка при удалении');
            setCategories(categories.filter(cat => cat.id !== deletionTargetId));
        }),
        {
            loading: 'Удаление...',
            success: <b>Категория удалена.</b>,
            error: <b>Не удалось удалить категорию.</b>,
        }
    );
    // Закрываем диалоговое окно после выполнения
    setDeletionTargetId(null);
  };

  return (
    <> {/* Оборачиваем все в фрагмент, чтобы добавить диалог в конце */}
      <div className="container mx-auto p-8 max-w-2xl">
        <Link href="/frontend/public" className="text-blue-500 hover:underline mb-8 inline-block">&larr; Назад на главную</Link>
        <h1 className="text-4xl font-bold mb-8">Управление категориями</h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Добавить новую категорию</h2>
          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Название категории"
              required
              className="flex-grow bg-gray-700 border-gray-600 rounded-md shadow-sm p-2"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Добавить
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Существующие категории</h2>
          {loading ? (<p>Загрузка...</p>) : (
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.id} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                  {editingCategory.id === cat.id ? (
                    <form onSubmit={handleUpdateCategory} className="flex-grow flex gap-2 items-center">
                      <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          autoFocus
                          className="flex-grow bg-gray-700 border-gray-600 rounded-md shadow-sm p-2"
                      />
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded">Сохранить</button>
                      <button type="button" onClick={() => setEditingCategory({ id: null, name: '' })} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded">Отмена</button>
                    </form>
                  ) : (
                    <>
                      <span className="text-lg">{cat.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name })} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded">Редактировать</button>
                        {/* 4. КНОПКА УДАЛЕНИЯ ТЕПЕРЬ ОТКРЫВАЕТ ДИАЛОГ */}
                        <button onClick={() => requestDeleteCategory(cat.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Удалить</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 5. РЕНДЕРИМ НАШ ДИАЛОГ */}
      <ConfirmationDialog
        isOpen={deletionTargetId !== null}
        title="Подтвердите удаление"
        message="Вы уверены, что хотите удалить эту категорию? Это действие необратимо."
        onConfirm={confirmDeleteCategory}
        onClose={() => setDeletionTargetId(null)}
      />
    </>
  );
}