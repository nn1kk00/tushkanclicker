const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Простая база данных в памяти (для демо)
// В продакшене замени на Redis/MongoDB/PostgreSQL
const gameSaves = new Map();

// Логирование
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Сохранение игры
app.post('/api/save', (req, res) => {
    try {
        const { userId, gameData } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID is required' 
            });
        }

        if (!gameData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Game data is required' 
            });
        }

        // Сохраняем данные
        gameSaves.set(userId, {
            ...gameData,
            lastServerSave: Date.now(),
            syncVersion: (gameSaves.get(userId)?.syncVersion || 0) + 1
        });

        console.log(`Game saved for user: ${userId}, version: ${gameSaves.get(userId).syncVersion}`);

        res.json({ 
            success: true, 
            savedAt: new Date().toISOString(),
            syncVersion: gameSaves.get(userId).syncVersion
        });

    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Загрузка игры
app.get('/api/load', (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID is required' 
            });
        }

        const saveData = gameSaves.get(userId);
        
        if (!saveData) {
            return res.status(404).json({ 
                success: false, 
                error: 'Save not found' 
            });
        }

        console.log(`Game loaded for user: ${userId}, version: ${saveData.syncVersion}`);

        res.json({ 
            success: true, 
            gameData: saveData,
            loadedAt: new Date().toISOString(),
            syncVersion: saveData.syncVersion
        });

    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Получить статистику (для админа)
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalUsers: gameSaves.size,
            serverUptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            lastSave: Array.from(gameSaves.entries()).map(([userId, data]) => ({
                userId,
                lastSave: new Date(data.lastServerSave).toISOString(),
                version: data.syncVersion
            }))
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running', 
        timestamp: new Date().toISOString() 
    });
});

// HTML страница для проверки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Game server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://YOUR_SERVER_IP:${PORT}`);
    console.log(`✅ Health check: http://YOUR_SERVER_IP:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    console.log(`💾 Total saves in memory: ${gameSaves.size}`);
    process.exit(0);
});
