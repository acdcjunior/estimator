
let ciphertext = 'U2FsdGVkX19GYfGuVL2yBP7Op+Xl37nIKBdVjFtqj9gGz8+Mrr10S9bzjsMgdqiiy1e8wFYrB85dRnG0OYflPhUo4spuI+K0w6ILGdvy7qQpHEuEQd3LVk8jyxI/PS+HlfO/TQfQmYfXGUKuBd+zIm6GM5cEco0FrzdmYHOnraVUatc2hF5ZNciz0LZVXg55oEI9rMHK4QIZi9r71hwEEGbVz5ZeyZ+rdKcimneVzdk=';
if (document.location.href.includes("?prod")) {
    ciphertext = "U2FsdGVkX1856Lmcvqx9BScXlLT8UlsGFtTSwxPwtZtwcfoZqgud30M2KXho2LQ3q/sDtH75CXmq5T3jgAi/1ag5ksNiyZUHozN54RcyOBuU5nElEUbys36BMwcIpZ0jeBhUQr+NynKpCt6QCilegpoA9xmkYncNYwwslt0v+SH9j4sokwmBaogwWh6cVjw7RXViESTmYYKMzpGGzsd6LPcl+mtxw8nQ7hsjJwAyfVo=";
}

function carregarConfig() {
    window.config = JSON.parse(CryptoJS.AES.decrypt(ciphertext, localStorage.getItem('storage_key')).toString(CryptoJS.enc.Utf8));
}

async function cardInfo(cardId) {
    let {data: card} = await axios.get(`https://api.trello.com/1/cards/${cardId}?key=${config.key}&token=${config.token}`);
    return card;
}
async function updateCardName(cardId, newName) {
    await axios.put(`https://api.trello.com/1/cards/${cardId}?name=${encodeURIComponent(newName)}&key=${config.key}&token=${config.token}`);
}

async function cardList() {
    let {data: cards} = await axios.get(`https://api.trello.com/1/lists/${config.idList}/cards?key=${config.key}&token=${config.token}`);
    return cards.map(card => ({name: card.name, id: card.id}));
}

async function novoCard({name, checkListName, items}) {
    let {data: card} = await axios.post(`https://api.trello.com/1/cards?name=${encodeURIComponent(name)}&idList=${config.idList}&keepFromSource=all&key=${config.key}&token=${config.token}`);
    criarCheckList({cardId: card.id, checkListName, items});
}

async function criarCheckList({cardId, checkListName, items}) {
    let {data: checklist} = await axios.post(`https://api.trello.com/1/checklists?idCard=${cardId}&name=${encodeURIComponent(checkListName)}&key=${config.key}&token=${config.token}`);
    for(let item of items) {
        await axios.post(`https://api.trello.com/1/checklists/${checklist.id}/checkItems?name=${encodeURIComponent(item)}&key=${config.key}&token=${config.token}`);
    }
}

const ESTIMATIVA_NO_NOME_REGEX = /^\s*\[\d+]/;

async function atualizarCardComEstimativas(cardId, peso, partesEstimadas) {
    let {name} = await cardInfo(cardId);
    let newName = name.replace(ESTIMATIVA_NO_NOME_REGEX, '').trim();
    updateCardName(cardId, `[${peso}] ${newName}`);
    for(let categoria of partesEstimadas) {
        await criarCheckList({cardId, checkListName: categoria.titulo, items: categoria.partes});
    }
}