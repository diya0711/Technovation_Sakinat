
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const avatarImg = document.getElementById('avatar-img');
    const avatarUpload = document.getElementById('avatar-upload');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const aboutMeTextarea = document.getElementById('about-me');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const statusInput = document.getElementById('status-input');
    const updateStatusBtn = document.getElementById('update-status-btn');
    const statusHistory = document.getElementById('status-history');

    // Load profile data
    loadProfile();

    // Event Listeners
    changeAvatarBtn.addEventListener('click', function () {
        avatarUpload.click();
    });

    avatarUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (event) {
                avatarImg.src = event.target.result;
                saveToLocalStorage('avatar', event.target.result);
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    saveProfileBtn.addEventListener('click', function () {
        saveToLocalStorage('aboutMe', aboutMeTextarea.value);
        alert('Profile saved successfully!');
    });

    updateStatusBtn.addEventListener('click', function () {
        if (statusInput.value.trim() !== '') {
            addStatus(statusInput.value);
            statusInput.value = '';
        }
    });

    // Functions
    function loadProfile() {
        // Load avatar
        const savedAvatar = localStorage.getItem('avatar');
        if (savedAvatar) {
            avatarImg.src = savedAvatar;
        }

        // Load about me
        const savedAboutMe = localStorage.getItem('aboutMe');
        if (savedAboutMe) {
            aboutMeTextarea.value = savedAboutMe;
        }

        // Load status history
        const savedStatuses = localStorage.getItem('statusHistory');
        if (savedStatuses) {
            statusHistory.innerHTML = '';
            const statuses = JSON.parse(savedStatuses);
            statuses.forEach(status => {
                addStatusToHistory(status.text, status.date);
            });
        }
    }

    function saveToLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }

    function addStatus(text) {
        const status = {
            text: text,
            date: new Date().toLocaleString()
        };

        addStatusToHistory(status.text, status.date);

        let statuses = [];
        const savedStatuses = localStorage.getItem('statusHistory');

        if (savedStatuses) {
            statuses = JSON.parse(savedStatuses);
        }

        statuses.unshift(status);
        localStorage.setItem('statusHistory', JSON.stringify(statuses));
    }

    function addStatusToHistory(text, date) {
        const statusItem = document.createElement('div');
        statusItem.className = 'status-item';
        statusItem.innerHTML = `<strong>${date}:</strong> ${text}`;

        if (statusHistory.firstChild) {
            statusHistory.insertBefore(statusItem, statusHistory.firstChild);
        } else {
            statusHistory.appendChild(statusItem);
        }
    }
});

// Mobile menu toggle
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}
