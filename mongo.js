const mongoose = require("mongoose");

if (![3, 5].includes(process.argv.length)) {
  console.log("usage: node mongo.js <password> <name> <number>");
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@phonebook.4gw4put.mongodb.net/?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

// connection to mongo
mongoose.connect(url).catch((e) => {
  console.log(e);
  process.exit(1);
});

// show all
if (process.argv.length === 3) {
  Person.find({}).then((results) => {
    console.log("phonebook:");
    results.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
    process.exit(0);
  });
} else {
  // create new person
  const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  newPerson.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}
