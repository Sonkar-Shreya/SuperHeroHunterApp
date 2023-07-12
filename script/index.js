/*
character: 
  https://gateway.marvel.com/v1/public/characters?ts=1686911318516&apikey=eb381db2398bd81e7738d7ca425f0cd2&hash=2691e0b093c73db20520302cabf72105&limit=50&nameStartsWith=spider
*/ 

// const privateKey = "13a5152a4108d079ad83ae4e766e26415557ba3b";
// const publicKey = "6b415ae7675a254fa82d7d6dfb09f1c1";

let publicKey = "eb381db2398bd81e7738d7ca425f0cd2";
let privateKey = "fec7ec85fed58c07a6d492cd9caf51f177a95b2e";

const InitialCharacters = ['1009610','1009664','1009220','1009351','1009187','1009268','1010743','1010802','1009718','1009407','1011358','1017111'];
const API_ERROR = 'something went wrong';

let searchedCharacters = [];
let initialCharacters = [];

/**
 * 
 * local storage things: for fav characters
 * 
 * */ 

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

/**
 * 
 * Ui rendering functions
 * 
 * */ 

const clearHeroesContainer = () => {
  const heroesContainer = document.getElementById('heroes-container');
  heroesContainer.innerHTML = '';
}

const generateHeroCard = (name = '', image = '', id = '') => {
  const heroCard = document.createElement('div');
  heroCard.classList.add('w-60', 'border', 'rounded-md', 'm-2', 'relative');
  heroCard.style.backgroundColor = 'rgb(203, 203, 203)';

  heroCard.addEventListener('click', () => {
    window.location.href = `../html/character.html?characterId=${id}`;
  });

  const heroImage = document.createElement('img');
  heroImage.src = image;

  const heroName = document.createElement('p');
  heroName.innerHTML = name;

  heroName.classList.add('text-slate-700', 'my-2', 'text-center', 'text-lg', 'py-2');

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

const changeVisibilitySearchContainer = (status) => {
  const heroesContainer = document.getElementById('search-container');
  heroesContainer.innerHTML = '';
  heroesContainer.style.display = status;

  const searchSection = document.getElementById('search-section');
  searchSection.style.display = (status=="flex")? "block" : "none" 
  
}

const renderSearchResult = (character) => {
  const heroesContainer = document.getElementById('search-container');

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
const showNoSearchResult = () => {
  const heroesContainer = document.getElementById('search-container');

  const noResultText = document.createElement('p');
  noResultText.innerHTML = 'No Result Found';
  noResultText.classList.add('text-4xl', 'text-red-500', 'text-center', 'w-full', 'my-10');

  heroesContainer.appendChild(noResultText);
}


/**
 * 
 * api functions
 * 
 * */ 

// fetches character/s
const fetchDetails = async (endPoint = '', id = '', search = null) => {
  let ts = new Date().getTime();
  let hash = CryptoJS.MD5(ts + privateKey + publicKey);

  const url = `https://gateway.marvel.com:443/v1/public/${endPoint}/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`

  const searchUrl = `https://gateway.marvel.com:443/v1/public/${endPoint}?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=50&nameStartsWith=${search}`

  try {
    const apiResponse = await fetch(!!search ? searchUrl : url)
    const result = await apiResponse.json();

    if(result.data.results.length < 0) throw new Error(API_ERROR);
    return !!search ? result.data.results : result.data.results[0];
  } catch(err) {
    return { message: API_ERROR }
  }
}

const init = async () => {
  for(const characterId of InitialCharacters) {
    const characterDetails = await fetchDetails('characters', characterId);
    initialCharacters.push(characterDetails);
    renderCharacter(characterDetails);
  }
}


init();


/**
 *  
 * Search bar
 *
 * */ 

function debounce(func, delay) {
  let timeoutId;

  return function() {
    const context = this;
    const args = arguments;

    clearTimeout(timeoutId);

    timeoutId = setTimeout(function() {
      func.apply(context, args);
    }, delay);
  };
}

const searchBar = document.getElementById('search-navbar');
const handleInput = async (e) => {
  const characterName = e.target.value;
  if(!characterName) {  
    changeVisibilitySearchContainer('none');
    return; 
  }
  changeVisibilitySearchContainer('flex');
  const characters = await fetchDetails('characters', '', characterName);
  for(const character of characters) {
    renderSearchResult(character);
  }
  if(characters.length === 0) {
    showNoSearchResult();
  }
}



searchBar.addEventListener('keyup', debounce(handleInput, 1000));
