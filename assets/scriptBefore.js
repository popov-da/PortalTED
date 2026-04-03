function isVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
}

function resolveResourceUrl(url) {
  try {
    return new URL(url, window.location.href).href;
  } catch (e) {
    return url;
  }
}

function isCrossOriginHttpUrl(url) {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    return new URL(url).origin !== window.location.origin;
  } catch (e) {
    return false;
  }
}

/** Панель «Открыть в новой вкладке» для внешних https-встраиваний (V3D, schem.io и т.д.) */
function setExternalEmbedUI(resolvedUrl) {
  const bar = document.getElementById("embedToolbar");
  const link = document.getElementById("embedToolbarLink");
  if (!bar || !link) return;
  if (resolvedUrl && isCrossOriginHttpUrl(resolvedUrl)) {
    bar.style.display = "flex";
    link.href = resolvedUrl;
  } else {
    bar.style.display = "none";
    link.removeAttribute("href");
  }
}

function formatHistoryQuery(element, contentUrl) {
  const params = new URLSearchParams();
  const nodeId = element.dataset.nodeId;
  const base = element.dataset.contentUrl;
  if (nodeId) params.set('node', nodeId);
  if (contentUrl && base && contentUrl !== base) params.set('doc', contentUrl);
  const s = params.toString();
  return s ? `?${s}` : '';
}

function fileItemByNodeId(nodeId) {
  if (!nodeId) return null;
  const items = document.querySelectorAll("[data-node-id]");
  for (let i = 0; i < items.length; i++) {
    if (items[i].dataset.nodeId === nodeId) return items[i];
  }
  return null;
}

function resetContentVideo() {
  const video = document.getElementById('contentVideo');
  if (!video) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
  video.style.display = 'none';
}

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
  resetContentVideo();
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
  const mediaStack = document.getElementById('contentMediaStack');
  if (mediaStack) mediaStack.style.display = 'none';
  setExternalEmbedUI(null);
}

// Функция загрузки документа с обновлением URL (?node=…, при варианте — &doc=…)
function loadContent(element, url, options) {
  const opts = options || {};
  const targetUrl = url || (element && element.dataset.contentUrl);
  if (!element || !targetUrl) return;

  hideStartPage(); // Скрываем стартовую страницу
  document.getElementById("selectMessage").style.display = "none"; // Скрываем сообщение о выборе документа
  const loadingIndicator = document.getElementById("loadingIndicator"); // Получаем индикатор загрузки
  loadingIndicator.style.display = "flex"; // Делаем индикатор видимым (flex-контейнер)

  resetActiveTabs(); // Сбрасываем активные вкладки
  element.classList.add("active"); // Добавляем активный класс к элементу, который выбрали

  if (!opts.skipHistory) {
    const q = formatHistoryQuery(element, targetUrl);
    history.pushState({}, '', q ? window.location.pathname + q : window.location.origin + window.location.pathname);
  }

  const contentFrame = document.getElementById("contentFrame");
  const contentVideo = document.getElementById("contentVideo");
  const mediaStack = document.getElementById("contentMediaStack");
  if (mediaStack) mediaStack.style.display = "flex";

  const resolved = resolveResourceUrl(targetUrl);

  if (isVideoUrl(resolved) && contentVideo) {
    setExternalEmbedUI(null);
    contentFrame.style.display = "none";
    contentFrame.src = "about:blank";
    contentVideo.style.display = "block";
    contentVideo.muted = true;
    var videoLoadTimer = null;
    function finishVideoLoad() {
      if (videoLoadTimer) {
        window.clearTimeout(videoLoadTimer);
        videoLoadTimer = null;
      }
      loadingIndicator.style.display = "none";
    }
    contentVideo.onloadedmetadata = finishVideoLoad;
    contentVideo.oncanplay = finishVideoLoad;
    contentVideo.onerror = finishVideoLoad;
    videoLoadTimer = window.setTimeout(finishVideoLoad, 15000);
    contentVideo.src = resolved;
    contentVideo.play().catch(function () {});
  } else {
    resetContentVideo();
    setExternalEmbedUI(resolved);
    contentFrame.onload = function () {
      loadingIndicator.style.display = "none";
    };
    contentFrame.onerror = function () {
      loadingIndicator.style.display = "none";
    };
    contentFrame.src = resolved;
    contentFrame.style.display = "block";
  }
}

function applyRouteFromLocation(isInitial) {
  const params = new URLSearchParams(window.location.search);
  const nodeId = params.get("node");
  const docUrl = params.get("doc");

  if (!nodeId && !docUrl) {
    if (!isInitial) showStartPage();
    return;
  }

  if (nodeId) {
    const el = fileItemByNodeId(nodeId);
    if (el) {
      const url = docUrl || el.dataset.contentUrl;
      if (url) loadContent(el, url, { skipHistory: true });
      return;
    }
  }

  if (docUrl) {
    const items = document.querySelectorAll("[data-content-url]");
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      if (el.dataset.contentUrl === docUrl) {
        loadContent(el, docUrl, { skipHistory: true });
        if (el.dataset.nodeId) {
          history.replaceState({}, "", window.location.pathname + formatHistoryQuery(el, docUrl));
        }
        return;
      }
    }

    const fileItems = document.querySelectorAll(".file-item");
    for (let j = 0; j < fileItems.length; j++) {
      const element = fileItems[j];
      const onclickValue = element.getAttribute("onclick");
      if (onclickValue && onclickValue.includes(docUrl)) {
        loadContent(element, docUrl, { skipHistory: true });
        if (element.dataset.nodeId) {
          history.replaceState({}, "", window.location.pathname + formatHistoryQuery(element, docUrl));
        }
        return;
      }
    }
  }

  showStartPage();
}

window.addEventListener("load", function () {
  applyRouteFromLocation(true);
});

window.addEventListener("popstate", function () {
  applyRouteFromLocation(false);
});

// Функция загрузки PDF / внешнего URL в iframe (клик по ссылке в строке)
function loadPdf(event, pdfUrl) {
  if (event.preventDefault) event.preventDefault();
  event.stopPropagation(); // Предотвращаем всплытие события, чтобы оно не обрабатывалось родительскими элементами
  const row = event.target.closest(".file-item");
  if (!row) return;
  loadContent(row, pdfUrl);
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
