
const displayArea = document.querySelector('.display-area');
const plainTextArea = document.querySelector('.plain-text');
const markdownArea = document.querySelector('.markdown');
const viewerArea = document.querySelector('.viewer');
const urlInput = document.querySelector('.url-input');  
const tabs = document.querySelector('.tabs');
const spinner = document.querySelector('.spinner');

urlInput.addEventListener('submit', event => getText(event));
tabs.addEventListener('click', event => setDisplayArea(Number(event.target.dataset.tab)));

function getText(event) {
  event.preventDefault();
  spinner.classList.add('show');
  const value = formatUrl(document.querySelector('.text-box').value);
  fetch(`./api/?url=${value}`)
    .then(response => response.json())
    .then(text => setLocalStorage(text));
}

function formatUrl(url) {
  return `http://${url.replace(/^(https?:|)\/\//, '')}`;
}

function setLocalStorage(text) {
  localStorage.setItem('stripaway', JSON.stringify(text));
  setDisplayArea();
}

function handleTabs(option) {
  tabs.classList.add('show');
  const tabsText = tabs.querySelectorAll('p');
  tabsText.forEach(tab => {
    const selected = 'selected-tab';
    tab.classList.contains(selected) && tab.classList.remove(selected);
    Number(tab.dataset.tab) === option && tab.classList.add(selected);
  });
}

function setDisplayArea(option = 0) {
  handleTabs(option);
  clearDisplayArea();
  const data = JSON.parse(localStorage.getItem('stripaway'));
  const areaToShow = [];
  switch (option) {
    case 1:
      areaToShow[0] = markdownArea;
      markdownArea.innerHTML = data.markdown;
      break;

    case 2:
      areaToShow[0] = viewerArea;
      viewerArea.innerHTML = data.viewer;
      break;

    default:
      areaToShow[0] = plainTextArea;
      plainTextArea.innerHTML = data.plain;
      break;
  }
  spinner.classList.remove('show');
  areaToShow[0].classList.add('show');
}

function clearDisplayArea() {
  displayArea.childNodes.forEach(node => node.classList && node.classList.remove('show'));
}
