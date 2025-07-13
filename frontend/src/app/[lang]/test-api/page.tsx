'use client'

export default function TestAPI() {
  const testAPI = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        alert('API работает! Ответ: ' + JSON.stringify(data));
      } else {
        alert('API не отвечает. Статус: ' + response.status);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка подключения: ' + error);
    }
  };

  const testLogin = async () => {
    try {
      console.log('Testing login...');
      const formData = new FormData();
      formData.append('username', 'admin@test.com');
      formData.append('password', 'admin123');

      const response = await fetch('http://localhost:8000/api/token', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);
        alert('Логин успешен! Токен: ' + data.access_token.substring(0, 20) + '...');
        
        // Сохраняем токен для дальнейшего использования
        localStorage.setItem('accessToken', data.access_token);
      } else {
        alert('Ошибка логина. Статус: ' + response.status);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Ошибка логина: ' + error);
    }
  };

  const testUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Сначала выполните логин');
        return;
      }

      console.log('Testing user info...');
      const response = await fetch('http://localhost:8000/api/users/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('User info response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User info data:', data);
        alert('Пользователь: ' + JSON.stringify(data));
      } else {
        alert('Ошибка получения пользователя. Статус: ' + response.status);
      }
    } catch (error) {
      console.error('User info error:', error);
      alert('Ошибка получения пользователя: ' + error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Тест API подключения</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testAPI}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          1. Тест базового подключения к API
        </button>
        
        <button 
          onClick={testLogin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          2. Тест логина админа
        </button>
        
        <button 
          onClick={testUserInfo}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          3. Тест получения информации о пользователе
        </button>
        
        <button 
          onClick={() => {
            localStorage.clear();
            alert('localStorage очищен');
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          4. Очистить localStorage
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          Откройте консоль браузера (F12) для подробных логов.
          <br />
          Последовательно нажмите все кнопки для диагностики проблемы.
        </p>
      </div>
    </div>
  );
}