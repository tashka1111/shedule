document.addEventListener("DOMContentLoaded", function () {
    const zeroLessonToggle = document.getElementById("zeroLessonToggle");
    const zeroLessonDaySelect = document.getElementById("zeroLessonDay");
    const zeroLessonLabel = document.getElementById("zeroLessonLabel");
    const scheduleTable = document.getElementById("schedule");
    const tableSelect = document.getElementById("tableSelect");
    const createTableBtn = document.getElementById("createTable");
    const deleteTableBtn = document.getElementById("deleteTable");  // Убедился, что элемент существует
    const headerTitle = document.querySelector("header h1");

    let tables = JSON.parse(localStorage.getItem("tables")) || {};
    let currentTable = null;

    function saveTables() {
        localStorage.setItem("tables", JSON.stringify(tables));
    }

    function updateTableList() {
        tableSelect.innerHTML = '<option value="">Выберите расписание</option>';
        Object.keys(tables).forEach(tableName => {
            const option = document.createElement("option");
            option.value = tableName;
            option.textContent = tableName;
            tableSelect.appendChild(option);
        });

        // Проверяем наличие deleteTableBtn перед изменением его стиля
        if (deleteTableBtn) {
            deleteTableBtn.style.display = Object.keys(tables).length > 0 ? "inline-block" : "none";
        }
    }

    function generateSchedule() {
        if (!currentTable || !tables[currentTable]) {
            scheduleTable.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Выберите расписание</td></tr>";
            return;
        }
    
        scheduleTable.innerHTML = ""; 
    
        let zeroLesson = tables[currentTable].zeroLesson || { enabled: false, day: "Пн" };
    
        if (zeroLesson.enabled) {
            zeroLessonToggle.value = "yes";
            zeroLessonDaySelect.value = zeroLesson.day;
            zeroLessonDaySelect.style.display = "inline-block";
            zeroLessonLabel.style.display = "inline-block";
            addLessonRow(0, zeroLesson.day);
        } else {
            zeroLessonToggle.value = "no";
            zeroLessonDaySelect.style.display = "none";
            zeroLessonLabel.style.display = "none";
        }
    
        for (let i = 1; i <= 7; i++) {
            addLessonRow(i);
        }
    
        console.log("Загружаем данные для", currentTable, tables[currentTable]); // Для отладки
        loadTableData(); // Загружаем сохранённые уроки после создания таблицы
    }
    

    function addLessonRow(lessonNumber, specificDay = null) {
        const row = document.createElement("tr");
        const lessonCell = document.createElement("td");
        lessonCell.textContent = lessonNumber;
        row.appendChild(lessonCell);

        const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        days.forEach(day => {
            const cell = document.createElement("td");
            cell.contentEditable = lessonNumber !== 0 || day === specificDay;
            cell.dataset.lesson = lessonNumber;
            cell.dataset.day = day;

            if (lessonNumber === 0 && day !== specificDay) {
                cell.style.backgroundColor = "#ddd";
            }

            cell.addEventListener("input", saveTableData);
            cell.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    addHomeworkText(cell);
                }
            });
            

            row.appendChild(cell);
        });

        scheduleTable.appendChild(row);
    }

    function saveTableData() {
        if (!currentTable) return;

        tables[currentTable].lessons = {};

        document.querySelectorAll("#schedule td[contenteditable='true']").forEach(cell => {
            const lesson = cell.dataset.lesson;
            const day = cell.dataset.day;
            if (!tables[currentTable].lessons[lesson]) tables[currentTable].lessons[lesson] = {};
            tables[currentTable].lessons[lesson][day] = cell.innerHTML;
        });

        saveTables();
    }

    function loadTableData() {
        if (!currentTable || !tables[currentTable] || !tables[currentTable].lessons) return;
    
        console.log("Данные перед загрузкой:", tables[currentTable].lessons); // Отладка
    
        document.querySelectorAll("#schedule td[contenteditable='true']").forEach(cell => {
            const lesson = cell.dataset.lesson;
            const day = cell.dataset.day;
            cell.innerHTML = tables[currentTable].lessons[lesson]?.[day] || "";
        });
    }
    

    createTableBtn.addEventListener("click", function () {
        const newTableName = prompt("Введите название расписания:");
        if (newTableName && !tables[newTableName]) {
            tables[newTableName] = { lessons: {}, zeroLesson: { enabled: false, day: "Пн" } };
            saveTables();
            updateTableList();

            currentTable = newTableName;
            tableSelect.value = newTableName;
            headerTitle.textContent = newTableName;
            generateSchedule();
        } else {
            alert("Это название уже используется или пустое!");
        }
    });

    deleteTableBtn?.addEventListener("click", function () {
        if (currentTable && confirm(`Вы уверены, что хотите удалить расписание "${currentTable}"?`)) {
            delete tables[currentTable];
            saveTables();
            updateTableList();
            localStorage.removeItem("currentTable");

            if (Object.keys(tables).length === 0) {
                currentTable = null;
                tableSelect.value = "";
                headerTitle.textContent = "Моё расписание";
                scheduleTable.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Нет доступных расписаний</td></tr>";
                deleteTableBtn.style.display = "none";
            } else {
                currentTable = Object.keys(tables)[0];
                localStorage.setItem("currentTable", currentTable);
                tableSelect.value = currentTable;
                headerTitle.textContent = currentTable;
                generateSchedule();
            }
        }
    });

    tableSelect.addEventListener("change", function () {
        console.log("Выбрана таблица:", tableSelect.value); // Проверяем, какая таблица выбрана
    
        currentTable = tableSelect.value;
        localStorage.setItem("currentTable", currentTable);
    
        if (currentTable) {
            console.log("Текущая таблица:", currentTable, tables[currentTable]); // Проверяем, какие данные у таблицы
            headerTitle.textContent = currentTable;
            loadZeroLessonSettings();
            generateSchedule();
        } else {
            headerTitle.textContent = "Моё расписание";
            scheduleTable.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Нет доступных расписаний</td></tr>";
        }
    });
    
    

    function loadZeroLessonSettings() {
        if (!currentTable || !tables[currentTable]?.zeroLesson) return;

        let zeroLesson = tables[currentTable].zeroLesson;
        zeroLessonToggle.value = zeroLesson.enabled ? "yes" : "no";
        zeroLessonDaySelect.value = zeroLesson.day || "Пн";

        updateZeroLessonUI();
    }
        
    function saveZeroLessonSettings() {
        if (!currentTable || !tables[currentTable]) return;
    
        tables[currentTable].zeroLesson = {
            enabled: zeroLessonToggle.value === "yes",
            day: zeroLessonDaySelect.value
        };
    
        saveTables(); // Сохраняем изменения
    }
    

    function updateZeroLessonUI() {
        if (zeroLessonToggle.value === "yes") {
            zeroLessonDaySelect.style.display = "inline-block";
            zeroLessonLabel.style.display = "inline-block";
        } else {
            zeroLessonDaySelect.style.display = "none";
            zeroLessonLabel.style.display = "none";
        }

        saveZeroLessonSettings();
        generateSchedule();
    }

    zeroLessonToggle.addEventListener("change", updateZeroLessonUI);
    zeroLessonDaySelect.addEventListener("change", updateZeroLessonUI);

    updateTableList();

    if (Object.keys(tables).length > 0) {
        const savedTable = localStorage.getItem("currentTable");
        currentTable = savedTable && tables[savedTable] ? savedTable : Object.keys(tables)[0];
        tableSelect.value = currentTable;
        headerTitle.textContent = currentTable;
        localStorage.setItem("currentTable", currentTable);
        loadZeroLessonSettings();
        generateSchedule();
    } else {
        scheduleTable.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Нет доступных расписаний</td></tr>";
    }
    function addHomeworkText(cell) {
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
    
        let existingHomework = cell.querySelector("i"); // Проверяем, есть ли уже "ДЗ:"
    
        if (!existingHomework) {
            // Добавляем "ДЗ:" и делаем всё курсивным
            cell.insertAdjacentHTML("beforeend", `<br><i>ДЗ: </i>`);
        } else {
            // Если "ДЗ:" уже есть, просто добавляем новую строку внутри <i>
            existingHomework.insertAdjacentHTML("beforeend", "<br>");
        }
    
        // Перемещаем курсор внутрь <i>, чтобы текст дальше оставался курсивным
        range = document.createRange();
        let italicBlock = cell.querySelector("i");
        if (italicBlock) {
            range.setStart(italicBlock, italicBlock.childNodes.length);
            range.collapse(true);
        }
    
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
});
