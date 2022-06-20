require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

// prints received data to logs
morgan.token("data", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return " ";
});
const tinyData =
  ":method :url :status :res[content-length] - :response-time ms :data";

app.use(express.json());
app.use(morgan(tinyData));
app.use(cors());
app.use(express.static("build"));

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (!person) return res.status(404).json({ error: "person not found" });
      res.json(person);
    })
    .catch((e) => next(e));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch((e) => next(e));
});

app.post("/api/persons", (req, res, next) => {
  const person = req.body;

  if (!person) {
    return res.status(400).json({
      error: "content missing",
    });
  } else if (!person.name) {
    return res.status(400).json({
      error: "name missing",
    });
  } else if (!person.number) {
    return res.status(400).json({
      error: "number missing",
    });
  }
  // TODO: check for duplicates in backend

  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });

  newPerson
    .save()
    .then((person) => res.json(person))
    .catch((e) => next(e));
});

app.put("/api/persons/:id", (req, res, next) => {
  const person = req.body;

  if (!person) return res.status(400).json({ error: "content missing" });

  const updatedPerson = {
    name: person.name,
    number: person.number,
  };

  Person.findByIdAndUpdate(req.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((p) => res.json(p))
    .catch((e) => next(e));
});

app.get("/info", (req, res) => {
  const time = new Date();
  Person.find({}).then((persons) =>
    res.send(
      `<div>Phonebook has info for ${persons.length} people</div>` +
        `<div>${time}</div>`
    )
  );
});

const unknownRoute = (req, res) => {
  res.status(404).end();
};
app.use(unknownRoute);

const errorHandler = (e, req, res, next) => {
  console.error(e.message);

  if (e.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (e.name === "ValidationError") {
    return res.status(400).send({ error: e.message });
  } else {
    console.log("error ----------------------------");
  }
  next(e);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
