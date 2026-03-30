// Функция скрытия стартовой страницы
function hideStartPage() {
  const startPage = document.getElementById('startPage'); // Получаем элемент с ID 'startPage'
  startPage.style.display = 'none'; // Скрываем стартовую страницу

  resetActiveTabs(); // Сбрасываем активные вкладки
}

// Функция сброса активных вкладок
function resetActiveTabs() {
  // Получаем все элементы с классом 'file-item' и перебираем их
  document.querySelectorAll('.file-item').forEach(item =>
    // Удаляем класс 'active' у каждого элемента
    item.classList.remove('active')
  );
}

// Функция показа стартовой страницы
function showStartPage() {
  document.getElementById('loadingIndicator').style.display = 'none'; // Скрываем индикатор загрузки
  document.getElementById('contentFrame').src = 'about:blank'; // Очищаем источник iframe, чтобы не отображался предыдущий контент
  document.getElementById('startPage').style.display = 'flex'; // Делаем стартовую страницу видимой (flex-контейнер)
  // Показываем все секции .skin-tree
  document.querySelectorAll('.skin-tree').forEach(section => section.style.display = 'block'); // Устанавливаем стиль 'block' для каждой секции
  // Показываем все элементы .file-item, входящие в секции .skin-tree
  document.querySelectorAll('.skin-tree > .file-item').forEach(item => item.style.display = 'flex'); // Устанавливаем стиль 'flex' для каждого элемента
  // Сбрасываем активные вкладки при возврате на стартовую страницу
  resetActiveTabs(); // Вызываем функцию, удаляющую класс 'active' у всех вкладок
  // Очистка URL при возврате на стартовую страницу
  history.pushState({}, '', window.location.origin + window.location.pathname); // Меняем URL на базовый (без параметров), не перезагружая страницу
  document.getElementById('selectMessage').style.display = 'none'; // Убираем подсказку «выберите элемент», если открывали раздел с плитки
  const contentFrame = document.getElementById('contentFrame');
  contentFrame.style.display = 'none'; // Контент в iframe на стартовой странице не показываем
}

// Функция загрузки документа с обновлением URL
function loadContent(element, url) {
  hideStartPage(); // Скрываем стартовую страницу
  document.getElementById("selectMessage").style.display = "none"; // Скрываем сообщение о выборе документа
  const loadingIndicator = document.getElementById("loadingIndicator"); // Получаем индикатор загрузки
  loadingIndicator.style.display = "flex"; // Делаем индикатор видимым (flex-контейнер)

  resetActiveTabs(); // Сбрасываем активные вкладки
  element.classList.add("active"); // Добавляем активный класс к элементу, который выбрали

  const contentFrame = document.getElementById("contentFrame"); // Получаем iframe, в который будем загружать документ
  contentFrame.onload = () => loadingIndicator.style.display = "none"; // Скрываем индикатор после загрузки контента в iframe
  contentFrame.src = url; // Устанавливаем адрес ресурса для iframe

  // Обновляем URL без перезагрузки страницы
  history.pushState({}, '', "?doc=" + encodeURIComponent(url)); // Добавляем параметр doc в адресную строку
  contentFrame.style.display = 'block'; // Показываем iframe с документом
}


// Функция обработки загрузки страницы с параметром doc
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search); // Получаем параметры из URL
  const docUrl = urlParams.get('doc'); // Извлекаем значение параметра 'doc'

  if (docUrl) { // Проверяем, есть ли значение у параметра 'doc'
    const elements = document.querySelectorAll(".file-item"); // Ищем все элементы с классом 'file-item'
    let found = false; // Флаг, указывающий, найден ли соответствующий элемент

    elements.forEach(element => { // Перебираем каждый элемент
      const onclickValue = element.getAttribute("onclick"); // Получаем строку, содержащуюся в атрибуте onclick
      if (onclickValue && onclickValue.includes(docUrl)) { // Проверяем, содержит ли эта строка параметр docUrl
        found = true; // Устанавливаем флаг в true, так как документ найден
        loadContent(element, docUrl); // Вызываем функцию загрузки документа с найденным элементом и ссылкой docUrl
      }
    });

    // Если среди элементов не нашлось подходящего, показываем стартовую страницу
    if (!found) {
      showStartPage(); // Вызываем функцию отображения стартовой страницы
    }
  }
});

// Функция загрузки PDF и предотвращения всплытия
function loadPdf(event, pdfUrl) {
  hideStartPage(); // Скрываем стартовую страницу при загрузке любого PDF
  event.stopPropagation(); // Предотвращаем всплытие события, чтобы оно не обрабатывалось родительскими элементами
  loadContent(event.target.closest('.file-item'), pdfUrl); // Загружаем PDF-документ, используя ближайший родительский элемент с классом 'file-item'
}

// Функция для скрытия/показа структуры
function toggleStructure() {
  const structure = document.getElementById('structure'); // Получаем элемент структуры по ID 'structure'
  const contentArea = document.getElementById('contentArea'); // Получаем основную область для отображения контента
  const resizer = document.getElementById('skin-split-pane'); // Получаем элемент-разделитель
  const toggleIcon = document.getElementById('toggleIcon'); // Получаем элемент иконки переключения

  if (structure.classList.contains('hidden')) {
    // Если структура скрыта, показываем ее и разделитель
    structure.classList.remove('hidden'); // Убираем класс 'hidden' со структуры
    contentArea.classList.remove('full-width'); // Убираем класс 'full-width' с области контента
    resizer.classList.remove('hidden'); // Показываем разделитель
    toggleIcon.textContent = '«'; // Меняем текст иконки на '«'
    structure.style.width = '20%'; // Устанавливаем ширину структуры в 20%
    contentArea.style.width = '80%'; // Устанавливаем ширину контентной области в 80%
  } else {
    // Иначе, если структура видна, скрываем ее и разделитель
    structure.classList.add('hidden'); // Добавляем класс 'hidden' для структуры
    contentArea.classList.add('full-width'); // Задаем контенту класс 'full-width'
    resizer.classList.add('hidden'); // Скрываем разделитель
    toggleIcon.textContent = '»'; // Меняем текст иконки на '»'
    structure.style.width = '0'; // Задаем структуре ширину 0, фактически скрывая ее
    contentArea.style.width = '100%'; // Устанавливаем ширину контентной области на 100%
  }
}

// Функция поиска по документации
function searchDocuments() {
  const searchText = document.getElementById('searchInput').value.toLowerCase(); // Получаем значение из поля ввода и приводим к нижнему регистру
  const fileItems = document.querySelectorAll('.file-item'); // Получаем все элементы с классом 'file-item'

  fileItems.forEach(item => {
    const itemText = item.textContent.toLowerCase(); // Получаем текст элемента и приводим к нижнему регистру
    if (itemText.includes(searchText)) {
      item.style.display = 'flex'; // Показываем элемент, если он содержит искомый текст
    } else {
      item.style.display = 'none'; // Скрываем элемент, если он не содержит искомый текст
    }
  });
}

// Функция очистка поиска
function clearSearch() {
  document.getElementById('searchInput').value = ''; // Очищаем поле поиска
  searchDocuments(); // Вызываем функцию поиска, чтобы отобразить все элементы (так как строка поиска теперь пустая)
}

// Показ раздела для Большой траверсы (эксплуатационная документация + позиция MTPA в интерактивной публикации)
function showMTPADocs() {
  hideStartPage();
  document.getElementById('selectMessage').style.display = 'flex';
  document.querySelectorAll('.skin-tree').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById('MTPASection').style.display = 'block';
  const ietp = document.getElementById('IETPSection');
  ietp.style.display = 'block';
  ietp.querySelectorAll('.file-item').forEach(item => {
    item.style.display = item.id === 'MTPASection2' ? 'flex' : 'none';
  });
}

// Показ раздела для Модуля
function showMDLDocs() {
  hideStartPage(); // Скрываем стартовую страницу
  document.getElementById('selectMessage').style.display = 'flex'; // Показываем сообщение о выборе раздела
  document.getElementById('MDLSection').style.display = 'block'; // Отображаем раздел для Модуля
  // Скрываем все остальные разделы, кроме #MDLSection
  document.querySelectorAll('.skin-tree:not(#MDLSection)').forEach(section => section.style.display = 'none');

  // функция для отображения элементов с ID PresentMDL
  document.getElementById('PresSection').style.display = 'block'; // Показываем секцию 'PresSection'

  // Получаем все элементы с классом .file-item внутри секции с ID 'PresSection'
  document.querySelectorAll('#PresSection .file-item').forEach(item => {
    item.style.display = item.id.includes('PresentMDL') ? 'flex' : 'none';
  });
}

// Показ раздела «Линейная траверса»: учебная документация + только пункт MTPM в интерактивной публикации
function showMTPMDocs() {
  hideStartPage();
  document.getElementById('selectMessage').style.display = 'flex';
  document.querySelectorAll('.skin-tree').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById('EducateSection').style.display = 'block';
  const ietp = document.getElementById('IETPSection');
  ietp.style.display = 'block';
  ietp.querySelectorAll('.file-item').forEach(item => {
    item.style.display = item.id === 'MTPMSection' ? 'flex' : 'none';
  });
}

// Показ раздела «Горизонт» — только презентация PresentGRZNT (отдельной секции в дереве нет)
function showGRZNTDocs() {
  hideStartPage();
  document.getElementById('selectMessage').style.display = 'flex';
  document.querySelectorAll('.skin-tree').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById('PresSection').style.display = 'block';
  document.querySelectorAll('#PresSection .file-item').forEach(item => {
    item.style.display = item.id.includes('PresentGRZNT') ? 'flex' : 'none';
  });
}

// Анимация и сообщение о повороте устройства
function checkOrientation() {
  const rotateMessage = document.getElementById('rotateMessage'); // Получаем элемент сообщения о повороте устройства

  if (window.matchMedia("(orientation: portrait)").matches) {
    // Если устройство в портретной ориентации
    rotateMessage.style.display = 'flex'; // Делаем сообщение видимым
  } else {
    // Если устройство в ландшафтной ориентации
    rotateMessage.style.display = 'none'; // Скрываем сообщение
  }
}

// Проверяем ориентацию при загрузке страницы
window.addEventListener('load', checkOrientation); // При загрузке окна вызываем функцию checkOrientation

// Отслеживаем изменения ориентации
window.addEventListener('orientationchange', checkOrientation); // При смене ориентации запускаем checkOrientation

// Убираем сообщение, если пользователь вручную изменяет ориентацию
window.addEventListener('resize', () => {
  const rotateMessage = document.getElementById('rotateMessage'); // Получаем элемент с сообщением о повороте
  // Если устройство не в портретной ориентации, скрываем сообщение
  if (!window.matchMedia("(orientation: portrait)").matches) {
    rotateMessage.style.display = 'none';
  }
});
