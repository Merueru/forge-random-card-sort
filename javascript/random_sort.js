function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const randomSortOrders = new Map();

function getRandomSortCardKey(card) {
    const name = (card.getAttribute("data-name") || "").trim();
    if (name) {
        return `name:${name}`;
    }

    const sortPath = card.dataset.sortPath || "";
    const sortName = card.dataset.sortName || "";
    return sortPath || sortName ? `sort:${sortPath}|${sortName}` : null;
}

function getRandomSortableCards(page) {
    return Array.from(page.children).filter(card => {
        return !card.matches('[data-no-random="true"], [data-no-favorite="true"], .forge-prompt-sets-add-card');
    });
}

function rememberRandomSortOrder(page, cards) {
    if (!page.id) {
        return;
    }

    const order = cards.map(getRandomSortCardKey).filter(Boolean);
    if (order.length) {
        randomSortOrders.set(page.id, order);
    }
}

function applyRandomSortOrder(page) {
    const savedOrder = randomSortOrders.get(page.id);
    if (!savedOrder) {
        return;
    }

    const cards = getRandomSortableCards(page);
    const cardsByKey = new Map(
        cards
            .map(card => [getRandomSortCardKey(card), card])
            .filter(([key]) => key),
    );
    const orderedCards = [];
    const usedKeys = new Set();

    savedOrder.forEach(key => {
        const card = cardsByKey.get(key);
        if (card && !usedKeys.has(key)) {
            orderedCards.push(card);
            usedKeys.add(key);
        }
    });

    cards.forEach(card => {
        const key = getRandomSortCardKey(card);
        if (!key || !usedKeys.has(key)) {
            orderedCards.push(card);
            if (key) {
                usedKeys.add(key);
            }
        }
    });

    if (orderedCards.every((card, index) => card === cards[index])) {
        return;
    }

    orderedCards.forEach(card => page.appendChild(card));
}

function applyAllRandomSortOrders() {
    gradioApp().querySelectorAll('.extra-network-cards').forEach(applyRandomSortOrder);
}

function clearRandomSortOrderForControl(control) {
    const controls = control.closest('[id$="_controls"]');
    if (!controls) {
        return;
    }

    randomSortOrders.delete(controls.id.replace(/_controls$/, "_cards"));
}

function randomSortCardsInPage(page) {
    const cards = getRandomSortableCards(page);

    shuffleArray(cards);

    cards.forEach(card => {
        page.appendChild(card);
    });

    rememberRandomSortOrder(page, cards);
}

function randomSortCardsForControl(control) {
    if (!control.id) {
        return;
    }

    const pageId = control.id.replace(/_controls$/, "_cards");
    const page = gradioApp().querySelector(`#${pageId}`);
    if (page) {
        randomSortCardsInPage(page);
    }
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
    button.style.padding = "6px 2px";
    button.style.borderRadius = "6px";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";

    searchContainers.forEach(container => {
        const randomButton = button.cloneNode(true);
        randomButton.onclick = () => {
            randomSortCardsForControl(container);
        };
        container.appendChild(randomButton);
    });
}

onUiLoaded(() => {
    document.addEventListener("click", event => {
        const target = event.target instanceof Element ? event.target : null;
        const control = target && target.closest(".extra-network-control--sort, .extra-network-control--sort-dir");
        if (control) {
            clearRandomSortOrderForControl(control);
        }
    }, true);

    setTimeout(() => {
        createRandomSortButton();
    }, 2000);
});

onAfterUiUpdate(() => {
    applyAllRandomSortOrders();
});
