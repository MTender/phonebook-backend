import express from "express";
import morgan from "morgan";
import cors from "cors";
import Contact from "./models/contact.js";

const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

morgan.token('body', (req,) => JSON.stringify(req.body))
const morganFormat = morgan(':method :url :status :res[content-length] - :response-time ms :body')
app.use(morganFormat)

const contactsPath = '/api/persons'
const infoPath = '/api/info'

app.get(contactsPath, (req, res) => {
    Contact.find({}).then(contacts => {
        res.json(contacts)
    })
})

app.get(`${contactsPath}/:id`, (req, res, next) => {
    Contact.findById(req.params.id)
        .then(contact => {
            res.json(contact)
        })
        .catch(error => next(error))
})

app.post(contactsPath, (req, res) => {
    const body = req.body

    if (!body.number) {
        return res.status(400).json({error: 'number field missing'})
    }
    if (!body.name) {
        return res.status(400).json({error: 'name field missing'})
    }

    // const existingContact = contacts.find(contact => contact.name === body.name)
    // if (existingContact) {
    //     return res.status(400).json({error: `contact from the name ${body.name} already exists`})
    // }

    const contact = new Contact({
        name: body.name,
        number: body.number
    })

    contact.save().then(savedContact => {
        res.json(savedContact)
    })
})

app.put(`${contactsPath}/:id`, (req, res, next) => {
    const body = req.body

    const contact = {
        name: body.name,
        number: body.number
    }

    Contact.findByIdAndUpdate(req.params.id, contact, {new: true})
        .then(updatedContact => {
            res.json(updatedContact)
        })
        .catch(error => next(error))
})

app.delete(`${contactsPath}/:id`, (req, res, next) => {
    Contact.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.get(infoPath, (req, res) => {
    Contact.countDocuments({}).then(count => {
        res.send(`Phonebook has info for ${count} people<br/>${new Date()}`)
    })
})

app.use((req, res) => res.status(404).end())

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({error: 'malformed id'})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})