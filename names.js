/**
 * Names database and random name creator
 */

var first_names = [
    "Abraham", "Buck",    "Chad",    "Dexter",
    "Elvis",   "Finn",    "George",  "Hannah",
    "Ian",     "Juan",    "Jim",     "Johnny",
    "Kim",     "Kevin",   "Leonard", "Lenny",
    "Moby",    "Marvin",  "Nick",    "Norbert",
    "Ophelia", "Pam",     "Quixote", "Robb",
    "Sam",     "Tommy",   "Ullyses", "Vivian",
    "Walter",  "Xena",    "Xavier",  "Yatima",
];

var last_names = [
    "Walker",      "Melon",        "Bottom",      "Button",
    "Manny",       "Jones",        "Jackson",     "Morrison",
    "Minamoto",    "de la Mancha", "the Brave",   "the Warrior",
    "the Puny",    "the Pink",     "the XVII-th", "Gilbert",
    "Hummin",      "Seldon",       "Venetti",
];

var random_name = function() {
    var first_name = first_names[parseInt(Math.random() * first_names.length)];
    var last_name = last_names[parseInt(Math.random() * last_names.length)];
    return first_name + " " + last_name;
};

exports.random_name = random_name;
