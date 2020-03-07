///////////////////////////////////////////////////////////////
//                                                           //
//                    Pokemon: Pokedex                       //
//              an adventure in fetch-chaining               //
//                 fun for the whole family!                 //
//                                                           //
//                                                           //
///////////////////////////////////////////////////////////////


///////////////////////////////////////
//
//  Global Variables
//

// When we load the images for the pokemon when we select a pokemon 
// type, just save ALL the pokemon data in an array of objects
// so the data's available without having to re-fetch it each time
let pokemonCollection = [];

// this is the string that's used to build output during the fetch calls
let HTMLstr = "";

///////////////////////////////////////
//
//   Helper Functions
//

// provide a random number between
// a certain range (min-max)
const getRandomInt = (min, max) => {
  return min + Math.floor(Math.random() * (max - min + 1));
}

//////////////////////////////////
//
//  Fetch functions
//  calls to the different API
//  endpoints to retrieve and process
//  the data we'll be using

//
//  Get all the different "types" of Pokemon
//  and make a button out of each type
//  to filter the data
//
const getAllTypes = () => {
  fetch('https://pokeapi.co/api/v2/type')
    .then(res=> res.json())
    .then(pokemonType => {
        pokemonType.results.forEach(function(typeOfPokemon){
        addButton(typeOfPokemon)
    })
  })
}

//
//  Show the evolution chain (at the bottom of the details panel)
//  of the current selected Pokemon
//
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
              poke1 = `<img onclick="showDetails(${pokemon.id})" title="${evChain.chain.species.name}" src="${pokemon.sprites.front_default}">`;
          }
          if (evChain.chain.evolves_to[0]){
          if (pokemon.name===evChain.chain.evolves_to[0].species.name) {
              poke2 = `<img onclick="showDetails(${pokemon.id})" title="${evChain.chain.evolves_to[0].species.name}" src="${pokemon.sprites.front_default}">`;
          }
          }
          if (evChain.chain.evolves_to){
          Object.values(evChain.chain.evolves_to).forEach(function(secondEv) {
            if(secondEv.evolves_to[0]){
             if (secondEv.evolves_to[0].species.name && pokemon.name===secondEv.evolves_to[0].species.name) {
              poke3 = `<img onclick="showDetails(${pokemon.id})" title="${secondEv.evolves_to[0].species.name}" src="${pokemon.sprites.front_default}">`;
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

const showTypeMove = (moveUrl) => {
  fetch(moveUrl)
  .then(res => res.json())
  .then(moveResults => {
    let moveHTML = "";
    let insertHP = moveResults.effect_entries[0].effect;
    if (moveResults.effect_chance) insertHP = moveResults.effect_entries[0].effect.replace("$effect_chance",moveResults.effect_chance.toString());
    moveHTML += `${moveResults.name}: ${insertHP}`;

    if (moveResults.accuracy) {
      moveHTML += `<div style="color:blue;"><br/>Accuracy: ${moveResults.accuracy}% <br/>Damage Class: ${moveResults.damage_class.name}  <br/>Target: ${moveResults.target.name}<br/></div>`;
    }
    document.getElementById("pokemonTypeMoveText").innerHTML = moveHTML;
  })
  .catch((error) => {
    console.log('Error: ',error);
  })
}

const showPokemonTypeDetails = (pokemonType) => {
      HTMLstr += `<div style="margin-bottom:10px;display:inline-block;"><div style="border-right:1px solid black;float:left;width:30%;margin-top:10px;display:inline-block;text-align:left;overflow-wrap:break-word;">
                <span style="float:left;font-size:24px;line-height:24px;font-family:pokemonSolid;">Damage Relations</span><p/><br/>
                <div style="font-size:10px;">`;

      for (let [key, value] of Object.entries(pokemonType.damage_relations)) {
        if(Array.isArray(value)) {
          HTMLstr += `<b>${key}</b> types =>  `;
          for(let i =0;i<value.length;i++){
            HTMLstr += `${value[i].name.toString()}  `;
      }
          HTMLstr += `<br/>`;
      } else  HTMLstr += `${key}: ${value}`;
      }
      HTMLstr += `</div></div>`;
      HTMLstr += `<div style="padding-left:4px;float:left;width:68%;margin-top:10px;display:inline-block;text-align:left;overflow-wrap:break-word;">
                  <span style="float:left;font-size:24px;line-height:24px;font-family:pokemonSolid;">Moves</span><p/><br/>
                  <div style="font-size:10px;padding-right:14px;">`;

      for (let i=0; i<pokemonType.moves.length;i++){
          HTMLstr += `<div style="float:left;margin:4px;" onclick="showTypeMove('${pokemonType.moves[i].url}')">${pokemonType.moves[i].name} </div>`;
      }
      HTMLstr += `</div></div></div>`;
      HTMLstr += `<div id="pokemonTypeMoveText"></div>`
      document.getElementById("output").innerHTML += HTMLstr
}

const clearDetailsPanel = () => {
  
  document.getElementById("name").innerHTML         ="";
  document.getElementById("bigPicture").innerHTML   =`<img src="img/Pokemon.png" style="max-width: 100%;"></img>`;
  document.getElementById("smallPix").innerHTML     ="";
  document.getElementById("moveText").innerHTML     ="";
  document.getElementById("movesList").innerHTML    ="";
  document.getElementById("abilitiesList").innerHTML="";
  document.getElementById("types").innerHTML        ="";
  document.getElementById("hitpointsDiv").innerHTML ="";
  document.getElementById("evolution").innerHTML    ="";
}

//
// Returns all the Pokemon of a certain type specified
// by the buttons on the nav panel on the left side
//
const getPokemonByType = (typeURL) => {
    clearDetailsPanel();
    document.body.style.backgroundImage="none";
    document.body.style.backgroundColor="#b9c0f0";
    fetch(typeURL)
      .then(res => res.json())
      .then(pokemonType => {
                HTMLstr ="";
                document.getElementById("output").innerHTML=HTMLstr;
                pokemonType.pokemon.forEach(function(pokemon){    
                  fetchPokemonData(pokemon.pokemon.url);   
                })
                showPokemonTypeDetails(pokemonType);                
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    
  }

//
// when the user clicks the small pictures in the details panel
// they replace the big picture at the top
//
  const changeSprite = (id) => {
    document.getElementById("bigPicture").innerHTML=document.getElementById(id).innerHTML;
  }

//
// when the user clicks one of the "moves" in the list on the details
// panel this posts the specific details of that move into its own box
//
  const showMove = (moveUrl) => {
    fetch(moveUrl)
    .then(res => res.json())
    .then(moveResults => {
      let moveHTML = "";
      let insertHP = moveResults.effect_entries[0].effect;
      if (moveResults.effect_chance) insertHP = moveResults.effect_entries[0].effect.replace("$effect_chance",moveResults.effect_chance.toString());
      moveHTML += `${moveResults.name}: ${insertHP}`;

      if (moveResults.accuracy) {
        moveHTML += `<div style="color:blue;"><br/>Accuracy: ${moveResults.accuracy}% <br/>Damage Class: ${moveResults.damage_class.name}  <br/>Target: ${moveResults.target.name}<br/></div>`;
      }
      document.getElementById("moveText").innerHTML = moveHTML;
    })
    .catch((error) => {
      console.log('Error: ',error);
    })
  }

//
// This function goes through the array we made to hold the pokemonCollection
// and gets all the specific info about the currently selected pokemon,
// parses it, then displays it to the details panel
//
  const showDetails = (id) => {

    let detailsDiv   = document.getElementById("details");
    let nameDiv      = document.getElementById("name");
    let bigPicture   = document.getElementById("bigPicture");
    let smallPix     = document.getElementById("smallPix");
    let moveText     = document.getElementById("moveText");
    let movesList    = document.getElementById("movesList");
    let abilitiesList= document.getElementById("abilitiesList");
    let typesDiv     = document.getElementById("types");
    let hitpointsDiv = document.getElementById("hitpointsDiv");
    
    let smallPixHTML = "";
    let abilitiesHTML= "";
    let movesHTML    = "";
    let statsHTML    = "";
    let typesHTML    = "Type(s): ";  

    let currentPokemon;

    // clear out the moves from the last entry
    moveText.innerHTML = "";

    // move the details panel to the top 
    // so the picture's the first thing showing
    detailsDiv.scrollTop = 0;

    // Get the object for the pokemon we're wanting to display
    for(let i=0;i<pokemonCollection.length;i++) {
      if (pokemonCollection[i].id===id) {
        currentPokemon=pokemonCollection[i];
      }
    }

    // print the pokemon's name at the top
    nameDiv.innerHTML = currentPokemon.name;
    // show the big picture
    bigPicture.innerHTML=`<img src="https://pokeres.bastionbot.org/images/pokemon/${id}.png"  onerror="this.onerror=null; this.src='img/noImg.png';" style="max-height:350px;">`;

    // output hitpoints
    if (currentPokemon.stats[5]) {
      for(let statCounter =0;statCounter<currentPokemon.stats.length;statCounter++){
      statsHTML += `<div style="width:16%;float:left;">
                  <div style="vertical-align:top;display:inline-block;width:100%;font-size:10px;height:30px;">${currentPokemon.stats[statCounter].stat.name}</div><div style="font-size:20px;"> ${currentPokemon.stats[statCounter].base_stat}</div>
                  </div>`;
      }
    }
    hitpointsDiv.innerHTML = statsHTML;
    
    
    // list whatever types the pokemon is
    // because some can be more than one type
    for (let i=0;i<currentPokemon.types.length;i++) {
      typesHTML+=`<div style="display:inline;"> ${currentPokemon.types[i].type.name} </div>`;
    }
    // display the pokemon's type(s)
    typesDiv.innerHTML = typesHTML;

    // get the sprites from the pokemon object for the 
    // different angle picture to display below the big picture
    Object.values(currentPokemon.sprites).forEach(function(sprite) {
      if(sprite) {
      // add a click listener so if the user clicks a small
      // picture it will replace the big picture
      smallPixHTML += `<div id="img${currentPokemon.id}${getRandomInt(1,40)}}" onclick="changeSprite(this.id)" style="float:left;max-height:50px;margin:14px;"><img id="img${currentPokemon.id}" src="${sprite}" style="width:100%;height:100%;"></div>`;
      }
    })
    // display the small pix
    smallPix.innerHTML=smallPixHTML;

    // loop through and get all the pokemon's abilities if there are any
    // these are nested pretty deep in the JSON 
    currentPokemon.abilities.forEach(function(ability){
      Object.entries(ability).forEach(function(detail){
        
          detail.forEach(function(abilityType) {
            if (typeof abilityType === "object") {
                  abilitiesHTML += `<div style="float:left;margin:4px;" onclick="showMove('${abilityType.url}')">${abilityType.name}</div>`;
            }
          })
        })
      })

    // do the same thing for their moves, also deeply nested in the JSON 
    currentPokemon.moves.forEach(function(move){
      Object.entries(move).forEach(function(detail){
        detail.forEach(function(moveType) {
            if (typeof moveType === "object") {
              if (moveType.name) {
                   movesHTML+= `<div style="float:left;margin:4px;" onclick="showMove('${moveType.url}')">${moveType.name}</div>`;
              }
            }
          })
        })
      })

      showEvolution(currentPokemon.species.url);
    
    abilitiesList.innerHTML = abilitiesHTML;
    movesList.innerHTML     = movesHTML;
}

//
// This routine calls each pokemon of the selected type,
// saves its information into the pokemonCollection array
// and outputs its picture to the main output in the center
//
const fetchPokemonData = (pokemon) => {
    let url = pokemon // <--- this is saving the pokemon url to a      
    //variable to us in a fetch.(Ex: https://pokeapi.co/api/v2/pokemon/1/)  
    fetch(url)  
    .then(response => response.json())  
    .then(pokeData =>
    {   
        pokemonCollection.push(pokeData);
        if(pokeData.sprites.front_default){
        HTMLstr += `<div class="pokeDex" id="${pokeData.id}" onclick="showDetails(${pokeData.id})" style="float:left;"><img src="${pokeData.sprites.front_default}" style="max-height:96px;"></div>`;
        }
      document.getElementById("output").innerHTML=HTMLstr;
  })}

//
//  This function adds a button for every different pokemon type
//  that when clicked will summon all pokemon of that type
//   
const addButton = (pokemonType) => {
  let select = document.getElementById("buttons");
  let button = document.createElement("button");
  button.className = "button";
  button.innerHTML = `${pokemonType.name}`;
  select.append(button);
  button.addEventListener ("click", function(){
    this.parentElement.querySelectorAll( ".clicked" ).forEach( e =>
     { e.classList.remove( "clicked" ) 
       e.classList.add("button")});
    this.className="clicked";
    getPokemonByType(pokemonType.url)});
}
  
//
//  We start out by selecting the different "type"s of pokemon
//  so we can instantiate the buttons on the left panel
//
window.onload = () => {
    getAllTypes();
}