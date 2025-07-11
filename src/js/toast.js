let timer = undefined;

export default function (text, duration = 3000) {
    if (!text) {
        return;
    }
    if (timer) {
        clearTimeout(timer);
    }

    const ele = document.querySelector('.mirror-toast');

    ele.firstElementChild.innerText = text;
    ele.classList.add('show');

    setTimeout(() => {
        ele.classList.remove('show');
        ele.classList.add('hide');
    }, duration);
}
