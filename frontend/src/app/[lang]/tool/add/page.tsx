// src/app/[lang]/tool/add/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTranslations } from '@/lib/translations';
import type { ICategory } from '@/types';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Типы для формы и ошибок ---
interface TranslationErrors {
  name?: string;
  description?: string;
}
interface FormErrors {
  url?: string;
  category_id?: string;
  pricing_model?: string;
  translations?: {
    ru?: TranslationErrors;
    en?: TranslationErrors;
    uk?: TranslationErrors;
  };
}
interface TranslationState {
  name: string;
  description: string;
}
interface FormData {
  url: string;
  icon_url: string;
  category_id: string;
  is_featured: boolean;
  pricing_model: 'free' | 'freemium' | 'paid' | 'trial' | '';
  platforms: string[];
  translations: {
    ru: TranslationState;
    en: TranslationState;
    uk: TranslationState;
  };
}

const AVAILABLE_PLATFORMS = ['Web', 'API', 'Windows', 'macOS', 'iOS', 'Android'];

export default function AddToolPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    url: '',
    icon_url: '',
    category_id: '',
    is_featured: false,
    pricing_model: '',
    platforms: [],
    translations: {
      ru: { name: '', description: '' },
      en: { name: '', description: '' },
      uk: { name: '', description: '' },
    },
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error(getTranslations(lang)('add_tool_unauthorized'));
      router.push(`/${lang}/login`);
    }
  }, [user, authLoading, lang, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/categories/`;
        const res = await fetch(apiUrl, { headers: { 'Accept-Language': lang } });
        if (res.ok) setCategories(await res.json());
      } catch (error) { console.error("Failed to fetch categories:", error); }
    };
    if (lang) void fetchCategories();
  }, [lang]);

  // ИСПРАВЛЕНИЕ: Полностью рабочая функция валидации
  const validateForm = (): boolean => {
    const newErrors: FormErrors = { translations: {} };
    let isValid = true;

    if (!formData.url.trim()) {
      newErrors.url = 'URL обязателен для заполнения.';
      isValid = false;
    } else {
      try { new URL(formData.url); } catch (_) {
        newErrors.url = 'Введите корректный URL-адрес.';
        isValid = false;
      }
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Необходимо выбрать категорию.';
      isValid = false;
    }
    if (!formData.pricing_model) {
        newErrors.pricing_model = "Необходимо выбрать модель ценообразования.";
        isValid = false;
    }
    const languages: ('ru' | 'en' | 'uk')[] = ['ru', 'en', 'uk'];
    for (const code of languages) {
        const translation = formData.translations[code];
        const langErrors: TranslationErrors = {};
        if (!translation.name.trim()) { langErrors.name = `Название (${code.toUpperCase()}) обязательно.`; isValid = false; }
        if (!translation.description.trim()) { langErrors.description = `Описание (${code.toUpperCase()}) обязательно.`; isValid = false; }
        if (Object.keys(langErrors).length > 0) {
            if (!newErrors.translations) newErrors.translations = {};
            newErrors.translations[code] = langErrors;
        }
    }
    setErrors(newErrors);
    return isValid;
  };

  // Обработчики формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePlatformChange = (platform: string) => {
    setFormData(prev => {
      const newPlatforms = prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform];
      return { ...prev, platforms: newPlatforms };
    });
  };

  const handleTranslationChange = (targetLang: 'ru' | 'en' | 'uk', e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, translations: { ...prev.translations, [targetLang]: { ...prev.translations[targetLang], [name]: value } } }));
  };

  // Отправка формы
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        toast.error('Пожалуйста, исправьте ошибки в форме.');
        return;
    }
    setFormLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
        toast.error('Ошибка аутентификации.');
        setFormLoading(false);
        return;
    }

    const payload = {
      url: formData.url,
      icon_url: formData.icon_url || null,
      category_id: Number(formData.category_id),
      is_featured: formData.is_featured,
      pricing_model: formData.pricing_model,
      platforms: formData.platforms,
      translations: Object.entries(formData.translations)
        .filter(([_, trans]) => trans.name && trans.description)
        .map(([langCode, trans]) => ({
          language_code: langCode,
          name: trans.name,
          description: trans.description,
        })),
    };

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/tools/`;
      const response = await axios.post(apiUrl, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Инструмент успешно добавлен!');
      router.push(`/${lang}/tool/${response.data.slug}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Не удалось добавить инструмент.';
      toast.error(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  if (!lang) return null;
  const t = getTranslations(lang);
  if (authLoading || !user) { return <div className="text-center p-12">Проверка авторизации...</div>; }
  const getErrorStyle = (hasError: boolean): string => hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500';
  const inputBaseStyle = "block w-full bg-slate-700 border rounded-md shadow-sm p-3 focus:ring focus:ring-opacity-50 transition-colors text-sm";
  const labelStyle = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-0">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-10 text-white">
        {t('add_tool_page_title')}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/50 p-6 sm:p-8 rounded-lg" noValidate>
        {/* Основная информация */}
        <div className="space-y-6">
           <h3 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-3">Основная информация</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="url" className={labelStyle}>{t('add_tool_form_url')}</label>
                    <input id="url" type="url" name="url" value={formData.url} onChange={handleInputChange} className={`${inputBaseStyle} ${getErrorStyle(!!errors.url)}`}/>
                    {errors.url && <p className="mt-1 text-sm text-red-400">{errors.url}</p>}
                </div>
                <div>
                    <label htmlFor="icon_url" className={labelStyle}>{t('add_tool_form_icon_url')}</label>
                    <input id="icon_url" type="url" name="icon_url" value={formData.icon_url} onChange={handleInputChange} className={inputBaseStyle}/>
                </div>
                <div>
                    <label htmlFor="category_id" className={labelStyle}>{t('add_tool_form_category')}</label>
                    <select id="category_id" name="category_id" value={formData.category_id} onChange={handleInputChange} className={`${inputBaseStyle} ${getErrorStyle(!!errors.category_id)}`}>
                        <option value="" disabled>{t('add_tool_form_select_category')}</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    {errors.category_id && <p className="mt-1 text-sm text-red-400">{errors.category_id}</p>}
                </div>
                <div>
                    <label htmlFor="pricing_model" className={labelStyle}>Модель ценообразования</label>
                    <select id="pricing_model" name="pricing_model" value={formData.pricing_model} onChange={handleInputChange} className={`${inputBaseStyle} ${getErrorStyle(!!errors.pricing_model)}`}>
                        <option value="" disabled>Выберите модель...</option>
                        <option value="free">Free (Бесплатно)</option>
                        <option value="freemium">Freemium</option>
                        <option value="paid">Paid (Платно)</option>
                        <option value="trial">Free Trial (Пробный период)</option>
                    </select>
                    {errors.pricing_model && <p className="mt-1 text-sm text-red-400">{errors.pricing_model}</p>}
                </div>
                <div className="md:col-span-2 flex items-center pt-4">
                    <input id="is_featured" type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="is_featured" className="ml-3 text-sm font-medium text-slate-300">{t('add_tool_form_is_featured')}</label>
                </div>
           </div>
           <div>
                <label className={labelStyle}>Поддерживаемые платформы</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {AVAILABLE_PLATFORMS.map(platform => (
                        <label key={platform} className="flex items-center space-x-2 text-sm text-slate-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.platforms.includes(platform)}
                                onChange={() => handlePlatformChange(platform)}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{platform}</span>
                        </label>
                    ))}
                </div>
           </div>
        </div>

        {/* Переводы */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-3">Переводы</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['ru', 'en', 'uk'] as const).map(code => (
                <div key={code} className="space-y-4">
                  <label className="font-semibold text-slate-400">{ {ru: 'Русский', en: 'English', uk: 'Українська'}[code] }</label>
                  <div>
                    <input type="text" name="name" value={formData.translations[code].name} onChange={(e) => handleTranslationChange(code, e)} placeholder={`${t('add_tool_form_name')} (${code.toUpperCase()})`} className={`${inputBaseStyle} ${getErrorStyle(!!errors.translations?.[code]?.name)}`}/>
                    {errors.translations?.[code]?.name && <p className="mt-1 text-sm text-red-400">{errors.translations[code]!.name}</p>}
                  </div>
                  <div>
                    <textarea name="description" value={formData.translations[code].description} onChange={(e) => handleTranslationChange(code, e)} placeholder={`${t('add_tool_form_description')} (${code.toUpperCase()})`} className={`${inputBaseStyle} h-24 ${getErrorStyle(!!errors.translations?.[code]?.description)}`}/>
                    {errors.translations?.[code]?.description && <p className="mt-1 text-sm text-red-400">{errors.translations[code]!.description}</p>}
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Кнопка отправки */}
        <div className="pt-5">
          <button type="submit" disabled={formLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg disabled:bg-slate-500 disabled:cursor-not-allowed">
            {formLoading ? 'Добавление...' : t('add_tool_form_submit_button')}
          </button>
        </div>
      </form>
    </div>
  );
}