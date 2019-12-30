const displayArea = document.querySelector('.display-area');
const plainTextArea = document.querySelector('.plain-text');
const markdownArea = document.querySelector('.markdown');
const simplifiedArea = document.querySelector('.simplified');
const urlInput = document.querySelector('.url-input');
const tabs = document.querySelector('.tabs');
const spinner = document.querySelector('.spinner');

function handleErrors(response) {
  return response.ok ? response : console.log(new Error(response.statusText));
}

function fetchHTML(event) {
  event.preventDefault();
  toggleClass(spinner, true);
  const value = formatUrl(document.querySelector('.text-box').value);
  fetch(`./api/?url=${value}`)
    .then(handleErrors)
    .then(response => response.json())
    .then(text => setLocalStorage(text))
    .catch(error => setLocalStorage({
      plain: `Please check your request. Error: ${error.message}`,
      markdown: '',
      simplified: ''
    }))
}

function formatUrl(url) {
  return `http://${url.replace(/^(https?:|)\/\//, '')}`;
}

function setLocalStorage(text) {
  localStorage.setItem('stripaway', JSON.stringify(text));
  setDisplayArea();
}

function handleTabs(option) {
  toggleClass(tabs, true);
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
      areaToShow[0] = simplifiedArea;
      simplifiedArea.innerHTML = data.simplified;
      break;

    default:
      areaToShow[0] = plainTextArea;
      plainTextArea.innerHTML = data.plain;
      break;
  }

  toggleClass(spinner, false);
  toggleClass(areaToShow[0], true);
}

function clearDisplayArea() {
  displayArea.childNodes.forEach(node => node.classList && toggleClass(node, false));
}

function toggleClass(element, show) {
  return show ? element.classList.add('show') : element.classList.remove('show');
}

urlInput.addEventListener('submit', event => fetchHTML(event));
tabs.addEventListener('click', event => setDisplayArea(Number(event.target.dataset.tab)));