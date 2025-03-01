document.addEventListener("DOMContentLoaded", function () {
    const zeroLessonToggle = document.getElementById("zeroLessonToggle");
    const zeroLessonDaySelect = document.getElementById("zeroLessonDay");
    const zeroLessonLabel = document.getElementById("zeroLessonLabel");
    const scheduleTable = document.getElementById("schedule");

    function generateSchedule() {
        scheduleTable.innerHTML = ""; // Очищаем расписание

        // Если выбран нулевой урок, показываем выпадающий список для дня
        if (zeroLessonToggle.value === "yes") {
            zeroLessonDaySelect.style.display = "inline-block";
            zeroLessonLabel.style.display = "inline-block";
            addLessonRow(0, zeroLessonDaySelect.value); // Добавляем нулевой урок
        } else {
            zeroLessonDaySelect.style.display = "none";
            zeroLessonLabel.style.display = "none";
        }

        // Добавляем уроки с 1 по 7
        for (let i = 1; i <= 7; i++) {
            addLessonRow(i);
        }
    }

    function addLessonRow(lessonNumber, specificDay = null) {
        const row = document.createElement("tr");

        // Номер урока
        const lessonCell = document.createElement("td");
        lessonCell.textContent = lessonNumber;
        row.appendChild(lessonCell);

        // Заполняем дни недели
        const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
        days.forEach(day => {
            const cell = document.createElement("td");
            cell.contentEditable = true;
            cell.dataset.lesson = lessonNumber;
            cell.dataset.day = day;
            cell.addEventListener("keydown", handleEnterPress);

            // Если это нулевой урок, оставляем только выбранный день
            if (lessonNumber === 0 && day !== specificDay) {
                cell.style.backgroundColor = "#ddd"; // Серый фон
                cell.contentEditable = false;
            }

            row.appendChild(cell);
        });

        scheduleTable.appendChild(row);
    }

    function handleEnterPress(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Отменяем стандартный переход на новую строку
            const cell = event.target;

            // Проверяем, есть ли уже ДЗ в ячейке
            if (!cell.querySelector(".homework")) {
                const hwDiv = document.createElement("div");
                hwDiv.classList.add("homework");
                hwDiv.style.color = "#555";
                hwDiv.style.fontStyle = "italic";
                hwDiv.textContent = "дз: ";
                cell.appendChild(document.createElement("br")); // Перенос строки
                cell.appendChild(hwDiv);

                // Устанавливаем курсор после "ДЗ: "
                const range = document.createRange();
                const selection = window.getSelection();
                range.setStart(hwDiv, 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    // Обновление при изменении выбора
    zeroLessonToggle.addEventListener("change", generateSchedule);
    zeroLessonDaySelect.addEventListener("change", generateSchedule);

    // Генерируем расписание при загрузке страницы
    generateSchedule();
});
