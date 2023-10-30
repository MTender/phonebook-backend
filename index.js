import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

morgan.token('body', (req,) => JSON.stringify(req.body))
const morganFormat = morgan(':method :url :status :res[content-length] - :response-time ms :body')
app.use(morganFormat)

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const personsPath = '/api/persons'
const infoPath = '/api/info'

app.get(personsPath, (req, res) => {
    res.json(persons)
})

app.get(`${personsPath}/:id`, (req, res) => {
    const id = Number(req.params.id)

    const person = persons.find(person => person.id === id)

    if (!person) {
        return res.status(404).end()
    }

    res.json(person)
})

app.post(personsPath, (req, res) => {
    const body = req.body

    if (!body.number) {
        return res.status(400).json({error: 'number field missing'})
    }
    if (!body.name) {
        return res.status(400).json({error: 'name field missing'})
    }

    const existingPerson = persons.find(person => person.name === body.name)
    if (existingPerson) {
        return res.status(400).json({error: `person by the name of ${body.name} already exists`})
    }

    const person = {
        id: Math.floor(Math.random() * 100000),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    res.json(person)
})

app.delete(`${personsPath}/:id`, (req, res) => {
    const id = Number(req.params.id)

    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

app.get(infoPath, (req, res) => {
    res.send(`Phonebook has info for ${persons.length} people<br/>${new Date()}`
    )
})

app.use((req, res) => res.status(404).end())

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})