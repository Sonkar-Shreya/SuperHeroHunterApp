
// const privateKey = "13a5152a4108d079ad83ae4e766e26415557ba3b";
// const publicKey = "6b415ae7675a254fa82d7d6dfb09f1c1";

// let publicKey = "eb381db2398bd81e7738d7ca425f0cd2";
// let privateKey = "fec7ec85fed58c07a6d492cd9caf51f177a95b2e";
let publicKey="9ab871748d83ae2eb5527ffd69e034de";
let privateKey="ad79003cf7316d9bd72c6eda71d1c93d7e807e90"

const API_ERROR = 'something went wrong';


const getFavCharacters = () => {
  return JSON.parse(localStorage.getItem('fav-heroes') || '[]');
}

const checkFavHero = (characterId) => {
  const favHeroes = getFavCharacters();
  return favHeroes.includes(characterId);
}

const toggleFavHero = (characterId) => {
  let favHeroes = getFavCharacters();
  if(favHeroes.includes(characterId)) {
    favHeroes = favHeroes.filter(id => id !== characterId);
  } else {
    favHeroes.push(characterId);
  }

  localStorage.setItem('fav-heroes', JSON.stringify(favHeroes));
}

const generateHeroCard = (name = '', image = '', id = '') => {
  const heroCard = document.createElement('div');
  heroCard.classList.add('w-60', 'bg-slate-50', 'border', 'rounded-md', 'm-2', 'relative','shadow-md');

  heroCard.addEventListener('click', () => {
    window.location.href = `../html/character.html?characterId=${id}`;
  });

  const heroImage = document.createElement('img');
  heroImage.src = image;

  const heroName = document.createElement('p');
  heroName.innerHTML = name;

  heroName.classList.add('text-slate-700', 'my-2', 'text-center', 'text-xl');

  const favButton = document.createElement('button');
  const isMarkedFav = checkFavHero(id);
  const heartIcon = isMarkedFav ? 'fa-solid' : 'fa-regular';
  favButton.classList.add(heartIcon, 'fa-heart', 'text-2xl', 'absolute', 'top-0.5', 'right-2', 'z-10');
  favButton.style.color = 'red';
  favButton.onclick = function(e) {
    e.stopPropagation();
    toggleFavHero(id);
    const isMarkedFav = checkFavHero(id);
    const heartIcon = isMarkedFav ? 'fa-solid' : 'fa-regular';
    const prevIcon = isMarkedFav ? 'fa-regular' : 'fa-solid';
    favButton.classList.replace(prevIcon, heartIcon);
    init(getFavCharacters());
  };

  heroCard.appendChild(heroImage);
  heroCard.appendChild(heroName);
  heroCard.appendChild(favButton);

  return heroCard;
};


const renderCharacter = (character) => {
  const heroesContainer = document.getElementById('heroes-container');

  //adding 's' to the path to make it https
  let path = character.thumbnail.path.split('');
  path.splice(4,0, "s");
  path = path.join('');

  let image = path+'.'+character.thumbnail.extension;
  if(image.includes('image_not_available')) {
    image = 'https://cdn.marvel.com/u/prod/marvel/images/OpenGraph-TW-1200x630.jpg';
  }

  const heroCard = generateHeroCard(character.name, image, character.id);

  heroesContainer.appendChild(heroCard);
}

const clearHeroesContainer = () => {
  const heroesContainer = document.getElementById('heroes-container');
  heroesContainer.innerHTML = '';
}

const displayNoDataFound = () => {
  const heroesContainer = document.getElementById('heroes-container');
  const noDataMessage = document.createElement('p');
  noDataMessage.innerHTML = 'No Data Found';
  noDataMessage.classList.add('text-3xl', 'text-center', 'text-red-600', 'font-semibold', 'w-full');
  heroesContainer.appendChild(noDataMessage);
}

/**
 * 
 * api functions
 * 
 * */ 

// fetches character from character id
const fetchCharacterFromCharacterId = async (charaterId = '') => {
  let ts = new Date().getTime();
  let hash = CryptoJS.MD5(ts + privateKey + publicKey);
  const url = `https://gateway.marvel.com:443/v1/public/characters/${charaterId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`

  try {
    const apiResponse = await fetch(url)
    const result = await apiResponse.json();

    if(result.data.results.length !== 1) throw new Error(API_ERROR)
    return result.data.results[0];

  } catch(err) {
    return { message: API_ERROR }
  }
}

const init = async (favCharacters) => {
  clearHeroesContainer();
  for(const characterId of favCharacters) {
    const characterDetails = await fetchCharacterFromCharacterId(characterId);
    renderCharacter(characterDetails);
  }
  if(favCharacters.length === 0) {
    displayNoDataFound();
  }
}


init(getFavCharacters());