// src/app/[lang]/my-tools/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTranslations } from '@/lib/translations';
import type { ITool } from '@/types';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function MyToolsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  const [myTools, setMyTools] = useState<ITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [toolToDelete, setToolToDelete] = useState<ITool | null>(null);

  const fetchMyTools = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      setLoading(true);
      // ИЗМЕНЕНИЕ 1: Используем переменную окружения
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/me/tools/`;
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': lang,
        },
      });
      setMyTools(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        toast.error("Сессия истекла. Пожалуйста, войдите заново.");
        router.push(`/${lang}/login`);
      } else {
        console.error("Failed to fetch user's tools", error);
        toast.error("Не удалось загрузить ваши инструменты.");
      }
    } finally {
      setLoading(false);
    }
  }, [lang, router]);

  useEffect(() => {
    if (!authLoading && user) {
      void fetchMyTools();
    }
  }, [user, authLoading, fetchMyTools]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login`);
    }
  }, [user, authLoading, lang, router]);

  const handleDeleteClick = (tool: ITool) => {
    setToolToDelete(tool);
  };

  const handleConfirmDelete = async () => {
    if (!toolToDelete) return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
        toast.error("Ошибка аутентификации.");
        setToolToDelete(null);
        return;
    }

    try {
        // ИЗМЕНЕНИЕ 2: Используем переменную окружения
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/tools/${toolToDelete.id}`;
        await axios.delete(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success("Инструмент успешно удален.");
        setMyTools(prevTools => prevTools.filter(tool => tool.id !== toolToDelete.id));
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                toast.error("Сессия истекла. Пожалуйста, войдите заново.");
                router.push(`/${lang}/login`);
            } else if (error.response.status === 404) {
                toast.error("Инструмент не найден. Возможно, он уже был удален.");
                setMyTools(prevTools => prevTools.filter(tool => tool.id !== toolToDelete.id));
            } else {
                console.error("Failed to delete tool:", error);
                toast.error("Не удалось удалить инструмент.");
            }
        } else {
            console.error("Failed to delete tool:", error);
            toast.error("Не удалось удалить инструмент.");
        }
    } finally {
        setToolToDelete(null);
    }
  }

  if (authLoading || !user) {
    return <div className="text-center p-12">Проверка авторизации...</div>;
  }

  if (loading) {
    return <div className="text-center p-12">Загрузка ваших инструментов...</div>;
  }

  const t = getTranslations(lang);

  return (
    <>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-10 text-white">
          {t('nav_my_tools')}
        </h1>

        {myTools.length > 0 ? (
          <div className="space-y-4">
            {myTools.map(tool => (
              <div key={tool.id} className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-lg text-white">{tool.name}</p>
                  {tool.category && <p className="text-sm text-slate-400">{tool.category.name}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleDeleteClick(tool)} className="text-sm font-medium text-red-400 hover:underline">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400">Вы пока не добавили ни одного инструмента.</p>
        )}

        <div className="mt-12 text-center">
            {/* ИЗМЕНЕНИЕ 3: Исправляем ссылку на /tool/add */}
            <Link href={`/${lang}/tool/add`} className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
              {t('nav_add_tool')}
            </Link>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!toolToDelete}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить инструмент "${toolToDelete?.name}"? Это действие необратимо.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setToolToDelete(null)}
      />
    </>
  );
}