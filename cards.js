// let ciphertext = CryptoJS.AES.encrypt(JSON.stringify({
//     idList: 'xxxxxxxxxxxxxxxxxxxxxxxx',
//     key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//     token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
// }), key).toString();
const ciphertext = 'U2FsdGVkX1+1r2JGaEw+UbwC3O9thMoHDdfaRxcNgXDABPVQ6RcQvjCpGEBkHagHpb+KY5GhNfe0J+V2e6JXmjKY6rVH4x9HyrmrZZsQnbtu1r+ZFrYxCAkk+laaMDnLBBteOF+RWRBO5rOSohs4ZkEQ247yDfDsfQfwDqoYg6tWdsgrpeDAMWdEtXmq6GIOOtcW4lsd8nHqof5OCHj+PFSH15lc8X29x0Ne3f+J2n8=';
const config = JSON.parse(CryptoJS.AES.decrypt(ciphertext, localStorage.getItem('key')).toString(CryptoJS.enc.Utf8));

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