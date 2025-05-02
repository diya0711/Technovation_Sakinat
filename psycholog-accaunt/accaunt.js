
document.addEventListener('DOMContentLoaded', function () {
    // DOM элементы
    const navBtns = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    // Элементы медиа-секции
    const photoUpload = document.getElementById('photo-upload');
    const videoUpload = document.getElementById('video-upload');
    const mediaGallery = document.getElementById('media-gallery');

    // Элементы тестов
    const testTitle = document.getElementById('test-title');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const saveTestBtn = document.getElementById('save-test-btn');
    const testsList = document.getElementById('tests-list');

    // Элементы аккаунта
    const accountAvatar = document.getElementById('account-avatar');
    const accountAvatarUpload = document.getElementById('account-avatar-upload');
    const changeAccountAvatarBtn = document.getElementById('change-account-avatar-btn');
    const accountUsername = document.getElementById('account-username');
    const accountBio = document.getElementById('account-bio');
    const saveAccountBtn = document.getElementById('save-account-btn');

    // Модальное окно
    const mediaModal = document.getElementById('media-modal');
    const modalImage = document.getElementById('modal-image');
    const modalVideo = document.getElementById('modal-video');
    const closeModal = document.querySelector('.close-modal');

    // Переключение между секциями
    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Удаляем активный класс у всех кнопок и секций
            navBtns.forEach(b => b.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));

            // Добавляем активный класс текущей кнопке и соответствующей секции
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Загрузка медиа
    photoUpload.addEventListener('change', function (e) {
        handleMediaUpload(e.target.files, 'image');
    });

    videoUpload.addEventListener('change', function (e) {
        handleMediaUpload(e.target.files, 'video');
    });

    // Изменение аватара аккаунта
    changeAccountAvatarBtn.addEventListener('click', function () {
        accountAvatarUpload.click();
    });

    accountAvatarUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();

            reader.onload = function (event) {
                accountAvatar.src = event.target.result;
                saveToLocalStorage('accountAvatar', event.target.result);
            }

            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Сохранение данных аккаунта
    saveAccountBtn.addEventListener('click', function () {
        saveToLocalStorage('accountUsername', accountUsername.value);
        saveToLocalStorage('accountBio', accountBio.value);
        alert('Данные аккаунта сохранены!');
    });

    // Добавление вопроса в тест
    addQuestionBtn.addEventListener('click', addNewQuestion);

    // Сохранение теста
    saveTestBtn.addEventListener('click', saveTest);

    // Закрытие модального окна
    closeModal.addEventListener('click', function () {
        mediaModal.style.display = 'none';
        modalImage.style.display = 'none';
        modalVideo.style.display = 'none';
    });

    // Закрытие модального окна при клике вне контента
    window.addEventListener('click', function (event) {
        if (event.target === mediaModal) {
            mediaModal.style.display = 'none';
            modalImage.style.display = 'none';
            modalVideo.style.display = 'none';
        }
    });

    // Загрузка данных при запуске
    loadAccountData();
    loadMedia();
    loadTests();

    // Функции
    function handleMediaUpload(files, type) {
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function (event) {
                const mediaData = {
                    url: event.target.result,
                    type: type,
                    name: file.name,
                    date: new Date().toLocaleString()
                };

                saveMedia(mediaData);
                displayMediaItem(mediaData);
            }

            reader.readAsDataURL(file);
        });
    }

    function saveMedia(mediaData) {
        let media = JSON.parse(localStorage.getItem('userMedia') || '[]');
        media.push(mediaData);
        localStorage.setItem('userMedia', JSON.stringify(media));
    }

    function displayMediaItem(mediaData) {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';

        if (mediaData.type === 'image') {
            mediaItem.innerHTML = `
            <img src="${mediaData.url}" alt="${mediaData.name}">
            <span class="media-type">Фото</span>
            <button class="delete-media" data-url="${mediaData.url}">&times;</button>
        `;
        } else {
            mediaItem.innerHTML = `
            <video src="${mediaData.url}" alt="${mediaData.name}"></video>
            <span class="media-type">Видео</span>
            <button class="delete-media" data-url="${mediaData.url}">&times;</button>
        `;
        }

        mediaGallery.appendChild(mediaItem);

        // Добавление обработчика клика для просмотра медиа
        const mediaElement = mediaItem.querySelector(mediaData.type === 'image' ? 'img' : 'video');
        mediaElement.addEventListener('click', function () {
            if (mediaData.type === 'image') {
                modalImage.src = mediaData.url;
                modalImage.style.display = 'block';
                modalVideo.style.display = 'none';
            } else {
                modalVideo.src = mediaData.url;
                modalVideo.style.display = 'block';
                modalImage.style.display = 'none';
            }
            mediaModal.style.display = 'block';
        });

        // Добавление обработчика для удаления медиа
        const deleteBtn = mediaItem.querySelector('.delete-media');
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (confirm('Удалить этот файл?')) {
                deleteMedia(mediaData.url);
                mediaItem.remove();
            }
        });
    }

    function deleteMedia(url) {
        let media = JSON.parse(localStorage.getItem('userMedia') || '[]');
        media = media.filter(item => item.url !== url);
        localStorage.setItem('userMedia', JSON.stringify(media));
    }

    function loadMedia() {
        const media = JSON.parse(localStorage.getItem('userMedia') || '[]');
        mediaGallery.innerHTML = '';
        media.forEach(mediaData => displayMediaItem(mediaData));
    }

    function addNewQuestion() {
        const questionId = Date.now();
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.dataset.id = questionId;

        questionItem.innerHTML = `
        <input type="text" placeholder="Введите вопрос" class="question-text">
        <div class="options-container" data-question-id="${questionId}">
            <!-- Варианты ответов будут здесь -->
        </div>
        <button class="add-option-btn" data-question-id="${questionId}">Добавить вариант</button>
        <button class="delete-question-btn">Удалить вопрос</button>
    `;

        questionsContainer.appendChild(questionItem);

        // Добавление первого варианта ответа
        addOption(questionId);

        // Обработчики для нового вопроса
        const addOptionBtn = questionItem.querySelector('.add-option-btn');
        addOptionBtn.addEventListener('click', function () {
            addOption(questionId);
        });

        const deleteQuestionBtn = questionItem.querySelector('.delete-question-btn');
        deleteQuestionBtn.addEventListener('click', function () {
            if (confirm('Удалить этот вопрос?')) {
                questionItem.remove();
            }
        });
    }

    function addOption(questionId) {
        const optionsContainer = document.querySelector(`.options-container[data-question-id="${questionId}"]`);
        const optionId = Date.now();

        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.innerHTML = `
        <input type="radio" name="correct-${questionId}" value="${optionId}">
        <input type="text" placeholder="Вариант ответа" class="option-text">
    `;

        optionsContainer.appendChild(optionItem);
    }

    function saveTest() {
        const title = testTitle.value.trim();
        if (!title) {
            alert('Введите название теста!');
            return;
        }

        const questions = [];
        const questionItems = document.querySelectorAll('.question-item');

        if (questionItems.length === 0) {
            alert('Добавьте хотя бы один вопрос!');
            return;
        }

        questionItems.forEach(questionItem => {
            const questionText = questionItem.querySelector('.question-text').value.trim();
            if (!questionText) return;

            const options = [];
            let correctOptionId = null;

            const optionItems = questionItem.querySelectorAll('.option-item');
            optionItems.forEach(optionItem => {
                const optionText = optionItem.querySelector('.option-text').value.trim();
                if (!optionText) return;

                const optionId = optionItem.querySelector('input[type="radio"]').value;
                options.push({
                    id: optionId,
                    text: optionText
                });

                if (optionItem.querySelector('input[type="radio"]').checked) {
                    correctOptionId = optionId;
                }
            });

            if (options.length > 0 && correctOptionId) {
                questions.push({
                    text: questionText,
                    options: options,
                    correctOptionId: correctOptionId
                });
            }
        });

        if (questions.length === 0) {
            alert('Нет валидных вопросов для сохранения!');
            return;
        }

        const test = {
            id: Date.now(),
            title: title,
            questions: questions,
            date: new Date().toLocaleString()
        };

        saveTestToStorage(test);
        displayTestItem(test);

        // Очистка формы
        testTitle.value = '';
        questionsContainer.innerHTML = '';

        alert('Тест успешно сохранен!');
    }

    function saveTestToStorage(test) {
        let tests = JSON.parse(localStorage.getItem('userTests') || '[]');
        tests.push(test);
        localStorage.setItem('userTests', JSON.stringify(tests));
    }

    function displayTestItem(test) {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        testItem.dataset.id = test.id;

        testItem.innerHTML = `
        <h3>${test.title}</h3>
        <p><small>Создан: ${test.date}</small></p>
        <p>Количество вопросов: ${test.questions.length}</p>
        <div class="test-actions">
            <button class="edit-test">Редактировать</button>
            <button class="delete-test">Удалить</button>
        </div>
    `;

        testsList.appendChild(testItem);

        // Обработчики для теста
        const deleteBtn = testItem.querySelector('.delete-test');
        deleteBtn.addEventListener('click', function () {
            if (confirm('Удалить этот тест?')) {
                deleteTest(test.id);
                testItem.remove();
            }
        });

        const editBtn = testItem.querySelector('.edit-test');
        editBtn.addEventListener('click', function () {
            editTest(test);
        });
    }

    function deleteTest(testId) {
        let tests = JSON.parse(localStorage.getItem('userTests') || '[]');
        tests = tests.filter(test => test.id !== testId);
        localStorage.setItem('userTests', JSON.stringify(tests));
    }

    function editTest(test) {
        // Переключаемся на вкладку тестов
        document.querySelector('.nav-btn[data-section="tests"]').click();

        // Заполняем форму
        testTitle.value = test.title;
        questionsContainer.innerHTML = '';

        test.questions.forEach(question => {
            addNewQuestion();
            const lastQuestion = questionsContainer.lastElementChild;

            // Заполняем вопрос
            lastQuestion.querySelector('.question-text').value = question.text;

            // Заполняем варианты ответов
            const optionsContainer = lastQuestion.querySelector('.options-container');
            optionsContainer.innerHTML = '';

            question.options.forEach(option => {
                const optionItem = document.createElement('div');
                optionItem.className = 'option-item';
                optionItem.innerHTML = `
                <input type="radio" name="correct-${lastQuestion.dataset.id}" value="${option.id}" 
                    ${option.id === question.correctOptionId ? 'checked' : ''}>
                <input type="text" placeholder="Вариант ответа" class="option-text" value="${option.text}">
            `;
                optionsContainer.appendChild(optionItem);
            });
        });

        // Удаляем редактируемый тест из списка
        deleteTest(test.id);
        document.querySelector(`.test-item[data-id="${test.id}"]`)?.remove();
    }

    function loadTests() {
        const tests = JSON.parse(localStorage.getItem('userTests') || '[]');
        testsList.innerHTML = '';
        tests.forEach(test => displayTestItem(test));
    }

    function loadAccountData() {
        const savedAvatar = localStorage.getItem('accountAvatar');
        if (savedAvatar) {
            accountAvatar.src = savedAvatar;
        }

        const savedUsername = localStorage.getItem('accountUsername');
        if (savedUsername) {
            accountUsername.value = savedUsername;
        }

        const savedBio = localStorage.getItem('accountBio');
        if (savedBio) {
            accountBio.value = savedBio;
        }
    }

    function saveToLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }
});

// burger
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
    const burger = document.querySelector('.burger');
    burger.classList.toggle('active');
    if (navMenu.classList.contains('active')) {
        navMenu.style.display = 'flex';
    } else {
        navMenu.style.display = 'none';
    }
}
