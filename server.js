const fs = require('fs');
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const { animals } = require('./data/animals');
const port = 3001;

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string'){
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string'){
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];

    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        if (typeof query.personalityTraits === 'string'){
            personalityTraitsArray = [query.personalityTraits];
        }else{
            personalityTraitsArray = query.personalityTraits;
        }
        /* for loop to loop through traits array
        and compare each animals traits against the search query
        to filter out any animal who does not posess the desired trait
        and creates a new array containing only the animals with the desired trait*/
        personalityTraitsArray.forEach(trait => {
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if(query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);        
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    return animal;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query){
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const results = findById(req.params.id, animals);
    if (results){
        res.json(results);
    }else{
        res.send(404);
    }
});

app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is not correct, send 400 error
    if (!validateAnimal(req.body)){
        res.status(400).send(`The animal is not properly formatted.`);
    }else{
        // add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);
    
        res.json(animal);
    }

});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});