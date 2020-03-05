
let pokemonCollection = [];

let pokemonTypes = [];

let HTMLstr = "";

const getRandomInt = (min, max) => {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const showEnemies = () => {
    let outPutString = "";
    for (let i=0;i<enemies.length;i++) {
        outPutString+= `<div style="float:left;"><img src="${enemies[i].imgURL}" style="max-height:96px"><br>ID: ${enemies[i].id} <br/>${enemies[i].name} <br/>Hitpoints: ${enemies[i].hp}<br/></div>`;
    }
    document.getElementById("output").innerHTML=outPutString;
}

const getAllTypes = () => {
  fetch('https://pokeapi.co/api/v2/type')
    .then(res=> res.json())
    .then(pokemonType => {
        pokemonType.results.forEach(function(typeOfPokemon){
        pokemonTypes.push(typeOfPokemon);
        loadSelectBox(typeOfPokemon)
    })
  })
}

const showEvolution = (speciesUrl) => {
  fetch(speciesUrl)
    .then(res => res.json())
    .then(species => {
      fetch(species.evolution_chain.url)
      .then(res => res.json())
      .then(evChain => {
        let evHTML = "";
        let poke1 = "";
        let poke2 = "";
        let poke3 = "";
        document.getElementById("evolution").innerHTML="";
        pokemonCollection.forEach(function(pokemon) {
          if (pokemon.name===evChain.chain.species.name) {
              poke1 = `<img title="${evChain.chain.species.name}" src="${pokemon.sprites.front_default}">`;
          }
          if (evChain.chain.evolves_to[0]){
          if (pokemon.name===evChain.chain.evolves_to[0].species.name) {
              poke2 = `<img title="${evChain.chain.evolves_to[0].species.name}" src="${pokemon.sprites.front_default}">`;
          }
          }
          if (evChain.chain.evolves_to){
          Object.values(evChain.chain.evolves_to).forEach(function(secondEv) {
            if(secondEv.evolves_to[0]){
             if (secondEv.evolves_to[0].species.name && pokemon.name===secondEv.evolves_to[0].species.name) {
              poke3 = `<img title="${secondEv.evolves_to[0].species.name}" src="${pokemon.sprites.front_default}">`;
            }          
          }
          })
        }
        })

          evHTML = `${poke1}${poke2}${poke3}`;
          document.getElementById("evolution").innerHTML=evHTML;
      })
      .catch((error) => {
        console.error('Error:', error);
    })
})
}

const getPokemonByType = (typeURL) => {
    fetch(typeURL)
      .then(res => res.json())
      .then(pokemonType => {
                HTMLstr ="";
                document.getElementById("output").innerHTML=HTMLstr;
                pokemonType.pokemon.forEach(function(pokemon){    
                  fetchPokemonData(pokemon.pokemon.url);   
                })
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const changeSprite = (id) => {
    document.getElementById("bigPicture").innerHTML=document.getElementById(id).innerHTML;
  }

  const showMove = (moveUrl) => {
    fetch(moveUrl)
    .then(res => res.json())
    .then(moveResults => {
      let moveHTML = "";
      moveHTML += `${moveResults.name}: ${moveResults.flavor_text_entries[2].flavor_text}`;
      document.getElementById("moveText").innerHTML = moveHTML;
    })
    .catch((error) => {
      console.log('Error: ',error);
    })
  }

  const showDetails = (id) => {

    let detailsDiv  = document.getElementById("details");
    let nameDiv     = document.getElementById("name");
    let bigPicture  = document.getElementById("bigPicture");
    let smallPix    = document.getElementById("smallPix");
    let moveText    = document.getElementById("moveText");
    let smallPixHTML= "";
    let detailsText = document.getElementById("detailsText");
    let detailsHTML = `<span style="font-size:24px;">Abilities</span><br/>`;
    moveText.innerHTML = "";
    detailsDiv.scrollTop = 0;

    bigPicture.innerHTML=`<img src="https://pokeres.bastionbot.org/images/pokemon/${id}.png"  onerror="this.onerror=null; this.src='noImg.png';" style="max-height:350px;">`;

    let currentPokemon;

    for(let i=0;i<pokemonCollection.length;i++) {
      if (pokemonCollection[i].id===id) {
        currentPokemon=pokemonCollection[i];
      }
    }

    nameDiv.innerHTML = currentPokemon.name;

    Object.values(currentPokemon.sprites).forEach(function(sprite) {
      if(sprite) {
      smallPixHTML += `<div id="img${currentPokemon.id}${getRandomInt(1,40)}}" onclick="changeSprite(this.id)" style="float:left;max-height:50px;margin:14px;"><img id="img${currentPokemon.id}" src="${sprite}" style="width:100%;height:100%;"></div>`;
      }
    })
    smallPix.innerHTML=smallPixHTML;

    currentPokemon.abilities.forEach(function(ability){
      Object.entries(ability).forEach(function(detail){
        
          detail.forEach(function(abilityType) {
            if (typeof abilityType === "object") {
            detailsHTML+= `<br/>${abilityType.name}`;
            }
          })
        })
      })

    detailsHTML += `<p><span style="font-size:24px;">Moves</span><br/><div>`;

    currentPokemon.moves.forEach(function(move){
      Object.entries(move).forEach(function(detail){
        
          detail.forEach(function(moveType) {
            if (typeof moveType === "object") {
              if (moveType.name) {
                   detailsHTML+= `<div style="float:left;margin:4px;" onclick="showMove('${moveType.url}')">${moveType.name}</div>`;
              }
            }
          })
        })
      })

      showEvolution(currentPokemon.species.url);

      detailsHTML +=  `</div><div style="clear:both;font-size:24px;margin-top:20px;">Evolutions:</div>`;
 
    detailsText.innerHTML = detailsHTML;
  }

const fetchPokemonData = (pokemon) => {
    let url = pokemon // <--- this is saving the pokemon url to a      
    //variable to us in a fetch.(Ex: https://pokeapi.co/api/v2/pokemon/1/)  
    fetch(url)  
    .then(response => response.json())  
    .then(pokeData =>
    {   
      pokemonCollection.push(pokeData);
        if(pokeData.sprites.front_default){
        HTMLstr += `<div id="${pokeData.id}" onclick="showDetails(${pokeData.id})" style="float:left;"><img src="${pokeData.sprites.front_default}" style="max-height:96px;"></div>`;
        }
      document.getElementById("output").innerHTML=HTMLstr;
  })}
    
// loops through the enemies list
// and gets the data for each one 
const getAllEnemies = () => {
    for (let i = 0; i< 2;i++){
      getPokemonByType(i);
    }
};

const loadSelectBox = (pokemon) => {
  let select = document.getElementById("selectBox");
      select.append(new Option(pokemon.name, pokemon.url));
}
  
window.onload = () => {
    getAllTypes();
}