function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomSortLoraCards() {
    const pages = gradioApp().querySelectorAll('.extra-network-cards');

    pages.forEach(page => {
        const cards = Array.from(page.children).filter(card => {
            return !card.matches('[data-no-random="true"], [data-no-favorite="true"], .forge-prompt-sets-add-card');
        });

        shuffleArray(cards);

        cards.forEach(card => {
            page.appendChild(card);
        });
    });
}

function createRandomSortButton() {
    if (document.getElementById("random-lora-sort-btn")) {
        return;
    }

    const searchContainers = gradioApp().querySelectorAll('.extra-network-control');

    if (!searchContainers.length) {
        return;
    }

    const button = document.createElement("button");

    button.id = "random-lora-sort-btn";
    button.innerText = "🎲";
    button.title = "Random";

    button.style.marginLeft = "0px";
    button.style.padding = "6px 12px";
    button.style.borderRadius = "6px";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";

    button.onclick = () => {
        randomSortLoraCards();
    };

    searchContainers.forEach(container => {
        container.appendChild(button.cloneNode(true));
    });

    document.querySelectorAll('#random-lora-sort-btn').forEach(btn => {
        btn.onclick = () => {
            randomSortLoraCards();
        };
    });
}

onUiLoaded(() => {
    setTimeout(() => {
        createRandomSortButton();
    }, 2000);
});
