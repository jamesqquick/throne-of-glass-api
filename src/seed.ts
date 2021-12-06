import axios from 'axios';
import cheerio from 'cheerio';
import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection(connectionString);
connection.connect();

// using hard coded character names instead of loading from wiki page
const characterNames = [
    'Abraxos',
    'Aedion_Ashryver',
    'Aelin_Galathynius',
    'Anneith',
    'Ansel_of_Briarcliff',
    'Asterin_Blackbeak',
    'Blackbeak_Matron',
    'Borte',
    'Briar_Blackbeak',
    'Bronwen_Vanora',
    'Cadre',
    'Cairn',
    'Chaol_Westfall',
    'Connall',
    'Cresseida_Blueblood',
    'Crochan_Witches',
    'Cyrene',
    'Deanna',
    'Dorian_Havilliard',
    'Dorian_Havilliard_I',
    'Dresenda',
    'Duke_Perrington',
    'Edda_Blackbeak',
    'Elena_Galathynius_Havilliard',
    'Elgan',
    'Elide_Lochan',
    'Endymion_Whitethorn',
    'Erawan',
    'Essar',
    'Evangeline',
    'Fae',
    'Faline_Blackbeak',
    'Falkan_Ennar',
    'Fallon_Blackbeak',
    'Farasha',
    'Farnor',
    'Fendir',
    'Fenrys_Moonbeam',
    'Fleetfoot',
    'Galan_Ashryver',
    'Gavriel',
    'Ghislaine_Blackbeak',
    'Glennis_Crochan',
    'Hasar',
    'Hellas',
    'Human',
    'Ilias',
    'Ilken',
    'Imogen_Blackbeak',
    'Kaltain_Rompier',
    'Kaya_Blackbeak',
    'Keva',
    'Kharankui',
    'Kyllian',
    'Lady_of_the_Great_Deep',
    'Linnea_Blackbeak',
    'Lorcan_Salvaterre',
    'Lord_Westfall',
    'Lumas',
    'Lysandra',
    'Maeve',
    'Mala_Fire-Bringer',
    'Manon_Blackbeak',
    'Murtaugh_Allsbrook',
    'Nesryn_Faliq',
    'Ren_Allsbrook',
    'Rolfe',
    'Rowan_Whitethorn',
    'Ruk',
    'Sartaq',
    'Sellene_Whitethorn',
    'Sorrel_Blackbeak',
    'Temis',
    'The_Bane',
    'The_Lord_of_the_North',
    'The_Silent_Assassins',
    'The_Thirteen',
    'Thea_Blackbeak',
    'Three-Faced_Goddess',
    'Vernon_Lochan',
    'Vesta_Blackbeak',
    'Weylan_Darrow',
    'Yellowlegs_Matron',
    'Yeran',
    'Yrene_Westfall',
];

const getCharacterPageNames = async () => {
    const { data } = await axios.get('Category:Kingdom_of_Ash_characters');
    const $ = cheerio.load(data);
    const categories = $('ul.category-page__members-for-char');

    const characterPageNames = [];
    for (let i = 0; i < categories.length; i++) {
        const ul = categories[i];
        const characterLIs = $(ul).find('li.category-page__member');
        for (let j = 0; j < characterLIs.length; j++) {
            const li = characterLIs[j];
            const name = $(li).find('a.category-page__member-link').attr('href');
            characterPageNames.push(name);
        }
    }
    return characterPageNames;
};

const getCharacterInfo = async (characterName: string) => {
    const { data } = await axios.get(`https://throneofglass.fandom.com/wiki/${characterName}`);
    const $ = cheerio.load(data);
    let name = $('div[data-source="full name"] > div.pi-data-value.pi-font').text();
    const species = $('div[data-source="species"] > div.pi-data-value.pi-font').text();
    const image = $('.image.image-thumbnail > img').attr('src');
    if (!name) {
        const parts = characterName.split('/');
        const last = parts[parts.length - 1];
        name = last.replace('_', ' ');
    }
    const characterInfo = {
        name,
        species,
        image,
    };
    return characterInfo;
};

const loadCharacters = async () => {
    const characterInfoPromises = characterNames
        .map((characterName) => getCharacterInfo(characterName));
    const characters = await Promise.all(characterInfoPromises);
    // save them to the db
    console.log("Let's seed it");
    const values = characters
        .map((character, i) => [i, character.name, character.species, character.image]);
    console.log(values);
    const sql = 'INSERT INTO Characters (id, name, species, image) VALUES ?';
    connection.query(sql, [values], (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('YAYY');
    });
};

loadCharacters();
