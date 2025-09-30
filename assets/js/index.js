// Глобальные переменные игры
let aa = 0;
let a = 0;
let n = 500;
let nn = 500;
let s = 1;
let ss = 0;
let c = 100;
let userId = null;
let bounce = 1;

const URLElement = document.getElementById("URL")
    
setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 1500);

// Генерируем ID пользователя
function generateUserId() {
    // Пробуем получить из URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id') || urlParams.get('userid') || urlParams.get('tgid');
    if (urlId) {
        return urlId;
    }
    
    // Пробуем получить из localStorage
    const savedId = localStorage.getItem('tushkan_user_id');
    if (savedId) {
        return savedId;
    }
    
    // Генерируем новый ID
    const newId = 'user_' + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('tushkan_user_id', newId);
    return newId;
}

// ФИНАЛЬНАЯ ВЕРСИЯ - отправляет 1 раз
function shareProgress() {
    if (a === 0) {
        showNotification('Нет монет для вывода!');
        document.getElementById('error').play();
        return;
    }
    
    console.log('Вывод монет:', a + '.' + aa);
    
    // ТОЛЬКО ОДНО ДЕЙСТВИЕ
    const url = `https://t.me/TushkanRef_bot?start=Tushkan${a}`;
    
    // Для мобильных - deeplink, для десктопа - новая вкладка
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
        window.location.href = `tg://resolve?domain=TushkanRef_bot&start=Tushkan${a}`;
        a = 0;
        updateAllValues();
        saveGame();
        showNotification('Монеты выведены!');
    } else {
        window.open(url, '_blank');
        a = 0;
        updateAllValues();
        saveGame();
        showNotification('Монеты выведены!');
    }
}

// Функция для копирования в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showNotification('Ссылка скопирована в буфер обмена!');
        console.log('Ссылка скопирована:', text);
    }).catch(function(err) {
        console.error('Ошибка копирования:', err);
        showNotification('Ошибка копирования!');
        
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Ссылка скопирована!');
    });
}

// ПРОСТАЯ ФУНКЦИЯ СОХРАНЕНИЯ
function saveGame() {
    const currentTime = Math.floor(Date.now() / 1000); // UNIX время в секундах
    
    const gameData = {
        a: a,
        aa: aa,
        n: n,
        nn: nn,
        s: s,
        ss: ss,
        c: c,
        bounce: bounce,
        lastSaveTime: currentTime // Сохраняем время сохранения
    };
    
    console.log('СОХРАНЯЕМ для пользователя', userId, ':', gameData);
    
    try {
        localStorage.setItem('tushkan_save_' + userId, JSON.stringify(gameData));
        console.log('УСПЕШНО СОХРАНЕНО, время:', currentTime);
    } catch (e) {
        console.error('ОШИБКА СОХРАНЕНИЯ:', e);
    }
}

// ПРОСТАЯ ФУНКЦИЯ ЗАГРУЗКИ
function loadGame() {
    try {
        const saved = localStorage.getItem('tushkan_save_' + userId);
        if (saved) {
            const gameData = JSON.parse(saved);
            console.log('ЗАГРУЖАЕМ для пользователя', userId, ':', gameData);
            
            // Восстанавливаем данные
            a = gameData.a !== undefined ? gameData.a : 0;
            aa = gameData.aa !== undefined ? gameData.aa : 0;
            n = gameData.n !== undefined ? gameData.n : 500;
            nn = gameData.nn !== undefined ? gameData.nn : 500;
            s = gameData.s !== undefined ? gameData.s : 1;
            ss = gameData.ss !== undefined ? gameData.ss : 0;
            c = gameData.c !== undefined ? gameData.c : 100;
            bounce = gameData.bounce !== undefined ? gameData.bounce : 1;
            
            // Восстанавливаем накопленную энергию вне игры
            if (gameData.lastSaveTime) {
                calculateOfflineEnergy(gameData.lastSaveTime);
            }
            
            console.log('ДАННЫЕ ЗАГРУЖЕНЫ: n =', n);
            if (bounce == 1) {
            const temp = document.createElement('div');
            temp.innerHTML = `<h6 style="color: #0066ff09"><a id="Btn">опа пасхалко</a></h6>`; 
            document.body.appendChild(temp);
            temp.querySelector('#Btn').onclick = function() {
                document.body.removeChild(temp);
                bounce = 0;
                updateAllValues();
                saveGame();
                bounce1();
    };}
            return true;
        }
    } catch (e) {
        console.error('ОШИБКА ЗАГРУЗКИ:', e);
    }
    return false;
}

// Функция для расчета энергии, накопленной вне игры (1 энергия в 5 секунд)
function calculateOfflineEnergy(lastSaveTime) {
    const currentTime = Math.floor(Date.now() / 1000); // Текущее UNIX время в секундах
    const timeDiff = currentTime - lastSaveTime; // Разница во времени в секундах
    
    console.log('Время с последнего сохранения:', timeDiff, 'секунд');
    
    if (timeDiff > 0) {
        // Каждые 5 секунд = 1 единица энергии
        const energyGained = Math.floor(timeDiff / 5);
        
        console.log('Накоплено энергии вне игры:', energyGained, '(1 энергия в 5 секунд)');
        
        // Добавляем энергию, но не превышаем лимит
        n = Math.min(n + energyGained, nn);
        
        console.log('Энергия после восстановления:', n);
        
        // Сохраняем игру после восстановления энергии
        saveGame();
    }
}

// Функция для показа уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 18px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 1500);
}

function bounce1() {
    document.getElementById('bounce').play();
    const notification1 = document.createElement('div');
    const notification2 = document.createElement('div');
    const notification3 = document.createElement('div');
    notification1.style.cssText = `
        position: fixed;
        font-family: "main";
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 18px;
        text-align: center;
    `;
    notification2.style.cssText = `
        position: fixed;
        font-family: "main";
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 18px;
        text-align: center;
    `;
    notification3.style.cssText = `
        position: fixed;
        font-family: "main";
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 18px;
        text-align: center;
    `;
    notification1.innerHTML = `
        <img src='assets/img/kld.jpg' width=120 height=120 alt=' ' style="border-radius: 10px;">
        <h3>ТЫ нашел клад 👛, будешь его забирать?</h3>
        <hr>
        <button id="yesBtn1" style='border-radius: 10px; background: green; color: #fff; padding: 10px 20px; border: none; margin: 5px; cursor: pointer;'>Да</button>
        <button id="noBtn1" style='border-radius: 10px; background: red; color: #fff; padding: 10px 20px; border: none; margin: 5px; cursor: pointer;'>Нет</button>
    `;
    notification2.innerHTML = `
        <img src='assets/img/sad.jpg' width=120 height=120 alt=' ' style="border-radius: 10px;">
        <h3>Онит это мой клад 👛, отдай 😭😭😭</h3>
        <hr>
        <button id="yesBtn2" style='border-radius: 10px; background: green; color: #fff; padding: 10px 20px; border: none; margin: 5px; cursor: pointer;'>Прости (вернуть обратно)</button>
        <button id="noBtn2" style='border-radius: 10px; background: red; color: #fff; padding: 10px 20px; border: none; margin: 5px; cursor: pointer;'>АХАХАХ эт мои)</button>
    `;
    notification3.innerHTML = `
        <video width="120" height="120" controls autoplay muted playsinline>
            <source src="assets/run.mp4" type="video/mp4">
            Ваш браузер не поддерживает видео тег.
        </video>
        <h3>Та лан, оставь себе</h3>
        <hr>
        <button id="yesBtn3" style='border-radius: 10px; background: green; color: #fff; padding: 10px 20px; border: none; margin: 5px; cursor: pointer;'>ОК</button>
    `;
    
    document.body.appendChild(notification1);

    notification3.querySelector('#yesBtn3').onclick = function() {
        document.body.removeChild(notification3);
    };

    notification2.querySelector('#yesBtn2').onclick = function() {
        document.body.removeChild(notification2);
        bounce = 0;
        updateAllValues();
        saveGame();
        document.body.appendChild(notification3);
    };
    
    notification2.querySelector('#noBtn2').onclick = function() {
        document.body.removeChild(notification2);
        bounce = 0;
        a = 0;
        aa = 0;
        showNotification("Айайай, нельзя красть чужое");
        updateAllValues();
        saveGame();
    };
    
    // Добавляем обработчики после создания элемента
    notification1.querySelector('#yesBtn1').onclick = function() {
        document.body.removeChild(notification1);
        a += 10;
        updateAllValues();
        saveGame();
        document.body.appendChild(notification2);
        showNotification("Получено 10 монет!");
    };
    
    notification1.querySelector('#noBtn1').onclick = function() {
        document.body.removeChild(notification1);
        bounce = 0;
        updateAllValues();
        saveGame();
    };
}

// Функция для форматирования сотых
function formatHundreds(value) {
    return value < 10 ? '0' + value : value.toString();
}

// Функция обновления интерфейса
function updateAllValues() {
    document.getElementById("counter").textContent = n;
    document.getElementById("price").textContent = c;
    document.getElementById("silly").textContent = ss;
    document.getElementById("silly1").textContent = formatHundreds(s);
    document.getElementById("en1").textContent = nn;
    
    // Будущие значения для прокачки
    let nextS = s;
    let nextSs = ss;
    if (s < 99) {
        nextS = s + 1;
        nextSs = ss;
    } else {
        nextS = 0;
        nextSs = ss + 1;
    }
    
    document.getElementById("sily").textContent = nextSs;
    document.getElementById("sily1").textContent = formatHundreds(nextS);
    document.getElementById("en2").textContent = nn + 25;
    
    document.getElementById("ball").textContent = a + "." + formatHundreds(aa);
    document.getElementById("ball1").textContent = a + "." + formatHundreds(aa);
    
    // Обновляем отображение ID
    document.getElementById("nameElement").textContent = "ID: " + userId;
}

// Обработка десятичных долей
function processDecimal() {
    if (aa > 99) {
        const extra = Math.floor(aa / 100);
        a += extra;
        aa = aa % 100;
    }
}

// Обработчик клика
function handleClick() {
    if (n < 5) {
        document.getElementById('error').play();
        return;
    }
    
    document.getElementById('click').play();
    aa += s;
    processDecimal();
    n -= 5;
    updateAllValues();
    
    // Автосохранение каждые 5 кликов
    saveGame()
}

// Обработчик прокачки
function handleUpgrade() {
    if (a < c) {
        document.getElementById('error').play();
        return;
    }
    
    a -= c;
    nn += 25;
    c += 50;

    if (s < 99) { 
        s++; 
    } else { 
        s = 0; 
        ss++;
    }
    
    updateAllValues();
    saveGame(); // Сохраняем после каждой прокачки
}

// Загрузка при старте
document.addEventListener('DOMContentLoaded', function() {
    console.log('ЗАПУСК ИГРЫ...');
    
    // Генерируем/получаем ID пользователя
    userId = generateUserId();
    console.log('ID пользователя:', userId);
    
    // Пробуем загрузить сохранение
    if (loadGame()) {
        console.log('Сохранение загружено');
    } else {
        console.log('Нет сохранения, начинаем новую игру');
    }
    
    updateAllValues();

    // Восстановление энергии в реальном времени (1 энергия в 5 секунд)
    setInterval(() => {
        if (n < nn) { 
            n++;
            updateAllValues();
            saveGame();
        }
    }, 7000); // 5000 мс = 5 секунд

    // Автосохранение каждые 30 секунд
    setInterval(saveGame, 1000);

    // Назначаем обработчики
    document.getElementById('click-btn').addEventListener('click', handleClick);
    document.getElementById('pr-btn').addEventListener('click', handleUpgrade);

    // Сохранение при закрытии
    window.addEventListener('beforeunload', saveGame);

    // Тач-обработчики
    document.getElementById('click-btn').addEventListener('touchstart', function(e) {
        e.preventDefault();
        handleClick();
    });
});

// Функция для тестирования ссылки (введите в консоли testLink())
function testLink() {
    const url = `https://t.me/TushkanRef_bot?start=Tushkan${a}`;
    console.log('Тестовая ссылка:', url);
    
    // Показываем команду которая будет отправлена
    const command = url.split('start=')[1];
    console.log('Команда для бота:', command);
    
    return url;
}

// Функция для показа команды (введите в консоли showCommand())
function showCommand() {
    const nickname = userId;
    const coins = (a + (aa / 100)).toFixed(2);
    const power = (ss + (s / 100)).toFixed(2);
    const currentEnergy = n;
    const nextEnergy = nn;
    const price = c;
    
    const command = `/update ${nickname} ${coins} ${power} ${currentEnergy} ${nextEnergy} ${price}`;
    console.log('Команда для ручного ввода:', command);
    
    const encodedCommand = `/update%20${nickname}%20${coins}%20${power}%20${currentEnergy}%20${nextEnergy}%20${price}`;
    console.log('Команда с %20:', encodedCommand);
    
    return command;
}

// Функция для отладки оффлайн энергии (введите в консоли debugOfflineEnergy())
function debugOfflineEnergy() {
    const saved = localStorage.getItem('tushkan_save_' + userId);
    if (saved) {
        const gameData = JSON.parse(saved);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeDiff = currentTime - (gameData.lastSaveTime || currentTime);
        const energyGained = Math.floor(timeDiff / 7);
        
        console.log('=== ОТЛАДКА ОФФЛАЙН ЭНЕРГИИ ===');
        console.log('Последнее сохранение:', new Date((gameData.lastSaveTime || 0) * 1000));
        console.log('Текущее время:', new Date(currentTime * 1000));
        console.log('Разница во времени:', timeDiff, 'секунд');
        console.log('Скорость восстановления: 1 энергия в 5 секунд');
        console.log('Накоплено энергии:', energyGained);
        console.log('Максимальная энергия:', gameData.nn);
        console.log('Текущая энергия в сохранении:', gameData.n);
        console.log('Итоговая энергия:', Math.min(gameData.n + energyGained, gameData.nn));
        console.log('================================');
    } else {
        console.log('Сохранение не найдено');
    }
}
