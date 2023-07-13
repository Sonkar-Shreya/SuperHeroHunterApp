
// const privateKey = "13a5152a4108d079ad83ae4e766e26415557ba3b";
// const publicKey = "6b415ae7675a254fa82d7d6dfb09f1c1";

// let publicKey = "eb381db2398bd81e7738d7ca425f0cd2";
// let privateKey = "fec7ec85fed58c07a6d492cd9caf51f177a95b2e";
let publicKey="9ab871748d83ae2eb5527ffd69e034de";
let privateKey="ad79003cf7316d9bd72c6eda71d1c93d7e807e90"

const API_ERROR = 'something went wrong';

//

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

// character
const generateHeroCard = (name = '', image = '', id = '', description = '') => {
  const section = document.createElement('section');
  section.classList.add('bg-slate-700');

  const container = document.createElement('div');
  container.classList.add('grid', 'max-w-screen-xl', 'px-4', 'py-8', 'mx-auto', 'lg:gap-8', 'xl:gap-0', 'lg:py-16', 'lg:grid-cols-12');

  // left section: name and description
  const infoContainer = document.createElement('div');
  infoContainer.classList.add('mr-auto', 'place-self-center', 'lg:col-span-7');

  const heroName = document.createElement('p');
  heroName.classList.add('max-w-2xl', 'mb-4', 'text-4xl', 'font-extrabold', 'tracking-tight', 'leading-none', 'md:text-5xl', 'xl:text-6xl', 'text-red-400');

  const heroDescription = document.createElement('p');
  heroDescription.classList.add('max-w-2xl', 'mb-6', 'font-light', 'text-slate-400', 'lg:mb-8', 'md:text-lg', 'lg:text-xl', 'dark:text-slate-50');

  const favButton = document.createElement('button');
  const isMarkedFav = checkFavHero(id);
  const heartIcon = isMarkedFav ? 'fa-solid' : 'fa-regular';
  favButton.classList.add(heartIcon, 'fa-heart', 'text-2xl');
  favButton.style.color = 'red';
  favButton.onclick = function(){
    toggleFavHero(id);
    const isMarkedFav = checkFavHero(id);
    const heartIcon = isMarkedFav ? 'fa-solid' : 'fa-regular';
    const prevIcon = isMarkedFav ? 'fa-regular' : 'fa-solid';
    favButton.classList.replace(prevIcon, heartIcon);
  }

  // adding values
  heroName.innerHTML = name;
  heroDescription.innerHTML = description;

  infoContainer.appendChild(heroName);
  infoContainer.appendChild(heroDescription);
  infoContainer.appendChild(favButton);

  // right side, image
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('hidden', 'lg:mt-0', 'lg:col-span-5', 'lg:flex');

  // adding image
  const heroImage = document.createElement('img');
  heroImage.src = image;
  heroImage.alt = `Image of ${name}`;

  imageContainer.appendChild(heroImage);

  // appending left and right containers to main container
  container.appendChild(infoContainer);
  container.appendChild(imageContainer);

  // appending main container to section
  section.appendChild(container);

  return section;
}

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

  const { name, id, description } = character;

  const heroCard = generateHeroCard(name, image, id, description);

  heroesContainer.appendChild(heroCard);
}

// comics, events, stories

const generateDataCard = (title = '', image = '') => {
  const dataCard = document.createElement('div');
  
  dataCard.classList.add('w-1/6', 'bg-slate-50', 'border', 'rounded-md', 'm-2', 'shadow-md');


  const heroImage = document.createElement('img');
  heroImage.src = image;
  heroImage.style.width = '100%';

  const heroTitle = document.createElement('p');
  heroTitle.innerHTML = title;

  heroTitle.classList.add('text-slate-700', 'my-2', 'text-center', 'text-xl');


  dataCard.appendChild(heroImage);
  dataCard.appendChild(heroTitle);

  return dataCard;
}

const renderList = (parentId, data) => {
  const parentContainer = document.getElementById(parentId);

  //adding 's' to the path to make it https
  let path = data.thumbnail.path.split('');
  path.splice(4,0, "s");
  path = path.join('');

  let image = path+'.'+data.thumbnail.extension;
  if(image.includes('image_not_available')) {
    image = 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781839081521/you-are-not-deadpool-9781839081521_hr.jpg';
  }

  const { title } = data;

  const heroCard = generateDataCard(title, image);

  parentContainer.appendChild(heroCard);
}


/**
 * 
 * api functions
 * 
 * */ 

// fetches character from character id
const fetchDetailsById = async (endPoint = '', id = '') => {
  let ts = new Date().getTime();
  let hash = CryptoJS.MD5(ts + privateKey + publicKey);
  const url = `https://gateway.marvel.com:443/v1/public/${endPoint}/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`

  try {
    const apiResponse = await fetch(url)
    const result = await apiResponse.json();

    if(result.data.results.length !== 1) throw new Error(API_ERROR)
    return result.data.results[0];
  } catch(err) {
    return { message: API_ERROR }
  }
}

const fetchComics = async (comics) => {
  const comicIds = comics.map((comic) => {
    const { resourceURI } = comic;
    return resourceURI.split('/').at(-1);
  })

  for(const comicId of comicIds) {
    const comicDetails = await fetchDetailsById('comics', comicId);
    renderList('comics-container', comicDetails);
  }
}

const fetchEvents = async (events) => {
  const eventIds = events.map((event) => {
    const { resourceURI } = event;
    return resourceURI.split('/').at(-1);
  })

  for(const comicId of eventIds) {
    const eventsDetails = await fetchDetailsById('events', comicId);
    renderList('events-container', eventsDetails);
  }
}

const fetchSeries = async (series) => {
  const seriesIds = series.map((series) => {
    const { resourceURI } = series;
    return resourceURI.split('/').at(-1);
  })

  for(const seriesId of seriesIds) {
    const seriesDetails = await fetchDetailsById('comics', seriesId);
    renderList('series-container', seriesDetails);
  }
}

const init = async () => {
  const characterId = window.location.search.split('=')[1];
  const characterDetails = await fetchDetailsById('characters', characterId);

  const { comics, events, series } = characterDetails;

  fetchComics(comics.items);
  fetchEvents(events.items);
  fetchSeries(series.items);

  renderCharacter(characterDetails);
}




init();