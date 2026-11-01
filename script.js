const themeButton = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeButton.textContent = "Светлая тема";
}

themeButton.addEventListener("click", function() {
    const currentTheme =
        document.documentElement.getAttribute("data-theme");

    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
        themeButton.textContent = "Тёмная тема";
        localStorage.setItem("theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeButton.textContent = "Светлая тема";
        localStorage.setItem("theme", "dark");
    }
});

// ===== Закрытие карточек интересов =====

const interestCards = document.querySelectorAll(".interest-card");

interestCards.forEach(function (card) {
    card.addEventListener("click", function (event) {
        if (!card.open) {
            return;
        }

        const summary = card.querySelector("summary");

        if (summary.contains(event.target)) {
            return;
        }

        card.open = false;
    });
});

// ===== Всплывающее окно истории =====

const storyDialog = document.querySelector("#story-dialog");
const storyButton = document.querySelector(".story-button");
const storyClose = document.querySelector(".story-close");

// Открытие окна
storyButton.addEventListener("click", function () {
    storyDialog.showModal();
});

// Плавное закрытие окна
function closeStory() {
    if (!storyDialog.open || storyDialog.classList.contains("closing")) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        storyDialog.close();
        return;
    }

    storyDialog.classList.add("closing");
}

// Закрытие по кнопке
storyClose.addEventListener("click", closeStory);

// Закрытие по нажатию на затемнённый фон
storyDialog.addEventListener("click", function (event) {
    if (event.target !== storyDialog) {
        return;
    }

    const rect = storyDialog.getBoundingClientRect();

    const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

    if (clickedOutside) {
        closeStory();
    }
});

// Закрытие по клавише Escape
storyDialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    closeStory();
});

// Когда анимация закончилась, действительно закрываем окно
storyDialog.addEventListener("animationend", function (event) {
    if (
        event.target === storyDialog &&
        event.animationName === "dialog-disappear"
    ) {
        storyDialog.close();
    }
});

storyDialog.addEventListener("close", function () {
    storyDialog.classList.remove("closing");
});

// ===== Появление элементов при прокрутке =====

const revealElements = document.querySelectorAll(
    ".about-section, #interests, #stories"
);

const revealObserver = new IntersectionObserver(
    function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.1
    }
);

revealElements.forEach(function (element) {
    element.classList.add("reveal");
    revealObserver.observe(element);
});


 // ===== Лаборатория числа π =====

const piCanvas = document.getElementById("pi-canvas");
const piContext = piCanvas.getContext("2d");

const piCountInput = document.getElementById("pi-count");
const piColumnsInput = document.getElementById("pi-columns");
const piGenerateButton = document.getElementById("pi-generate");
const piStatus = document.getElementById("pi-status");
const piDownloadButton = document.getElementById("pi-download");

// Цвет каждой цифры от 0 до 9
const piColors = [
    "#854C59", "#EFB5C0", "#693541", "#D47A91",
    "#F6DBDF", "#A75B71", "#E6A3B3", "#794651",
    "#C98798", "#B96B80"
];

let piDigits = "";

// ===== Подсчёт статистики цифр π =====

function updatePiStatistics(count) {
    const chart = document.getElementById("pi-statistics-chart");

    // Массив для количества каждой цифры от 0 до 9
    const frequencies = new Array(10).fill(0);

    // Подсчитываем цифры в выбранном фрагменте
    for (let i = 0; i < count; i++) {
        const digit = Number(piDigits[i]);
        frequencies[digit]++;
    }

    // Находим максимальную частоту для масштабирования полосок
    const maxFrequency = Math.max(...frequencies);

    // Очищаем предыдущую диаграмму
    chart.replaceChildren();

    // Создаём по одной строке для каждой цифры
    for (let digit = 0; digit <= 9; digit++) {
        const frequency = frequencies[digit];
        const percentage = (frequency / count * 100).toFixed(1);

        const row = document.createElement("div");
        row.className = "pi-stat-row";

        const digitLabel = document.createElement("span");
        digitLabel.className = "pi-stat-digit";
        digitLabel.textContent = digit;

        const barBackground = document.createElement("div");
        barBackground.className = "pi-stat-bar-background";

        const bar = document.createElement("div");
        bar.className = "pi-stat-bar";
        bar.style.backgroundColor = piColors[digit];
        bar.style.width =
            (frequency / maxFrequency * 100) + "%";

        barBackground.appendChild(bar);

        const valueLabel = document.createElement("span");
        valueLabel.className = "pi-stat-value";
        valueLabel.textContent =
            frequency + " (" + percentage + "%)";

        row.appendChild(digitLabel);
        row.appendChild(barBackground);
        row.appendChild(valueLabel);

        chart.appendChild(row);
    }
}

// Загрузка цифр из файла
async function loadPiDigits() {
    try {
        const response = await fetch("pi-digits.txt");

        if (!response.ok) {
            throw new Error("Не удалось загрузить цифры π");
        }

        piDigits = (await response.text()).trim();

        if (!/^\d+$/.test(piDigits)) {
            throw new Error("Некорректное содержимое файла");
        }

        drawPi();
    } catch (error) {
        piStatus.textContent = "Ошибка загрузки: " + error.message;
    }
}

// Построение цветной сетки
function drawPi() {
    const count = Number(piCountInput.value);
    const columns = Number(piColumnsInput.value);

    if (!Number.isInteger(count) ||
        count < 10 || count > piDigits.length ||
        !Number.isInteger(columns) ||
        columns < 5 || columns > 50) {
        piStatus.textContent =
            "Проверь параметры: цифры от 10 до " +
            piDigits.length + ", столбцы от 5 до 50.";
        return;
    }

    const cellSize = 20;
    const rows = Math.ceil(count / columns);

    piCanvas.width = columns * cellSize;
    piCanvas.height = rows * cellSize;

    piContext.clearRect(
        0, 0, piCanvas.width, piCanvas.height
    );

    for (let i = 0; i < count; i++) {
        const digit = Number(piDigits[i]);

        const column = i % columns;
        const row = Math.floor(i / columns);

        piContext.fillStyle = piColors[digit];

        piContext.fillRect(
            column * cellSize,
            row * cellSize,
            cellSize,
            cellSize
        );
    }

    piStatus.textContent =
        "Построено " + count + " цифр числа π.";

    updatePiStatistics(count);
    piDownloadButton.disabled = false;
}

piGenerateButton.addEventListener("click", drawPi);

// Управление полями с помощью Enter
piCountInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();

        piColumnsInput.focus();
        piColumnsInput.select();
    }
});

piColumnsInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();

        drawPi();
        piGenerateButton.focus();
    }
});

loadPiDigits();


// ===== Сохранение цветного ковра в PNG =====

piDownloadButton.addEventListener("click", function () {
    // Превращаем содержимое canvas в PNG
    const imageUrl = piCanvas.toDataURL("image/png");

    // Создаём временную ссылку для скачивания
    const link = document.createElement("a");

    link.href = imageUrl;

    // Имя файла с параметрами изображения
    link.download =
        "pi-carpet-" +
        piCanvas.width / 20 + "x" +
        piCanvas.height / 20 + ".png";

    // Запускаем скачивание
    document.body.appendChild(link);
    link.click();
    link.remove();
});
