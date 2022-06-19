const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

morgan.token("data", (req, res) => {
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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;
  return maxId + 1;
};

const duplicateName = (name) => {
  name = name.toLowerCase();
  return persons.some((p) => p.name.toLowerCase() === name);
};

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const person = req.body;

  if (!person) {
    return res.status(400).json({
      error: "content missing",
    });
  } else if (!("name" in person) || person.name.length < 1) {
    return res.status(400).json({
      error: "name missing",
    });
  } else if (!("number" in person) || person.number.length < 1) {
    return res.status(400).json({
      error: "number missing",
    });
  } else if (duplicateName(person.name)) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const newPerson = {
    id: generateId(),
    name: person.name,
    number: person.number,
  };

  persons = persons.concat(newPerson);
  res.json(newPerson);
});

app.get("/info", (req, res) => {
  const time = new Date();
  res.send(
    `<div>Phonebook has info for ${persons.length} people</div>` +
      `<div>${time}</div>`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
