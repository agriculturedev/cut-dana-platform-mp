// Adds an EventListener to all "chain link" elements next to headings.
const links = document.getElementsByClassName("headerlink");

for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", onClick);
}

/** Copies the current URL into the user's clipboard.
 *  This needs to be delayed by a bit since the browser needs to update the URL before it's copied.
 *  @return {void} */
function onClick () {
    setTimeout(() => {
        const url = window.location.href;

        navigator.clipboard.writeText(url);
    }, 10);
}
