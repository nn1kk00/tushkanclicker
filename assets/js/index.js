// Конфигурация сервера - ЗАМЕНИ НА СВОЙ IP/ДОМЕН
const SERVER_URL = 'http://192.168.1.44:3000/api'; // Ваш белый IP
const SYNC_ENABLED = true; // Включить синхронизацию

// Улучшенная функция сохранения на сервер
async function saveToServer(gameData) {
    if (!SYNC_ENABLED) return { success: false, reason: 'sync_disabled' };
    
    try {
        const response = await fetch(`${SERVER_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                gameData: gameData,
                timestamp: Date.now()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Данные сохранены на сервер:', result);
            return { success: true, data: result };
        } else {
            throw new Error(result.error || 'Unknown server error');
        }
        
    } catch (error) {
        console.error('❌ Ошибка сохранения на сервер:', error);
        return { 
            success: false, 
            error: error.message,
            fallback: 'local' // Указываем что нужно сохранить локально
        };
    }
}

// Улучшенная функция загрузки с сервера
async function loadFromServer() {
    if (!SYNC_ENABLED) return { success: false, reason: 'sync_disabled' };
    
    try {
        const response = await fetch(`${SERVER_URL}/load?userId=${encodeURIComponent(userId)}`);
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Данные загружены с сервера:', result);
            return { success: true, data: result.gameData };
        } else if (result.error === 'Save not found') {
            return { success: false, reason: 'not_found' };
        } else {
            throw new Error(result.error || 'Unknown server error');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки с сервера:', error);
        return { 
            success: false, 
            error: error.message,
            fallback: 'local' // Указываем что нужно загрузить локально
        };
    }
}
