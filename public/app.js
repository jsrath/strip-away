document.querySelector('button').addEventListener('click', getText);
const displayArea = document.querySelector('.display-area');
const plainTextArea = document.querySelector('.plain-text');
const markdownArea = document.querySelector('.markdown');
const viewerArea = document.querySelector('.viewer');
const tabs = document.querySelector('.tabs');

tabs.addEventListener('click', (event ) => setDisplayArea(Number(event.target.dataset.tab)));

function getText() {
  const value = formatUrl(document.querySelector('.text-box').value);
  fetch(`./api/?url=${value}`)
    .then(response => response.json())
    .then(text => setLocalStorage(text));
}

function formatUrl(url) {
  return `http://${url.replace(/^(https?:|)\/\//, '')}`
}

function setLocalStorage(text) {
  localStorage.setItem('sitestrip', JSON.stringify(text));
  setDisplayArea();
}

const observer = new MutationObserver(setAreaHeight);
observer.observe(displayArea, { subtree: true, childList: true });

function setAreaHeight() {
  const currentlyDisplayed = displayArea.querySelector('.show');
  currentlyDisplayed.style.height = `${currentlyDisplayed.scrollHeight}px`;
}

function setDisplayArea(option) {
  const data = JSON.parse(localStorage.getItem('sitestrip'));
  tabs.classList.add('show');
  clearDisplayArea();
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
  areaToShow[0].classList.add('show');
}

function clearDisplayArea() {
  displayArea.childNodes.forEach(node => node.classList && node.classList.remove('show'));
}

