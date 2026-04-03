const resizer = document.getElementById('skin-split-pane'); // Получаем элемент-разделитель
const leftPanel = document.getElementById('structure'); // Получаем левую панель со структурой
const rightPanel = document.getElementById('contentArea'); // Получаем правую панель с контентом
const container = document.querySelector('.container'); // Получаем общий контейнер, в котором находятся панели

let isResizing = false; // Флаг, указывающий, происходит ли в данный момент изменение размера
let startX = 0; // Начальное положение курсора по оси X
let startWidth = 0; // Начальная ширина левой панели

resizer.addEventListener('mousedown', (e) => {
  e.preventDefault(); // Предотвращаем стандартные действия браузера (например, выделение текста)
  isResizing = true; // Устанавливаем флаг, что мы начали изменение размера
  startX = e.clientX; // Запоминаем текущую позицию курсора по оси X
  startWidth = leftPanel.offsetWidth; // Запоминаем текущую ширину левой панели
  document.body.style.cursor = 'col-resize'; // Меняем курсор на «изменение размера по горизонтали»
  document.body.style.pointerEvents = 'none'; // Отключаем события указателя для тела страницы
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return; // Если не происходит изменение размера, выходим

  e.preventDefault(); // Предотвращаем стандартное поведение браузера
  const deltaX = e.clientX - startX; // Разница между начальной и текущей позицией курсора по оси X
  // Вычисляем новую ширину левой панели в процентах относительно ширины контейнера
  const newWidth = ((startWidth + deltaX) / container.offsetWidth) * 100;

  // Ограничиваем ширину левой панели между 15% и 40%
  if (newWidth >= 15 && newWidth <= 40) {
    leftPanel.style.width = `${newWidth}%`; // Устанавливаем новую ширину левой панели
    rightPanel.style.width = `${100 - newWidth}%`; // Устанавливаем оставшуюся ширину для правой панели
  }
});

document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false; // Останавливаем процесс изменения размера
    document.body.style.cursor = 'default'; // Возвращаем курсор в исходное состояние
    document.body.style.pointerEvents = ''; // Включаем события указателя для тела страницы
  }
});
