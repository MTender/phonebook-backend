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

    Contact.find({})
        .then(contacts => {
            res.json(contacts)
        })
})

app.get(`${contactsPath}/:id`, (req, res, next) => {
    Contact.findById(req.params.id)
        .then(contact => {
            if (!contact) return res.status(404).end()

            res.json(contact)
        })
        .catch(error => next(error))
})

app.post(contactsPath, (req, res, next) => {
    const body = req.body

    const contact = new Contact({
        name: body.name,
        number: body.number
    })

    contact.save()
        .then(savedContact => {
            res.json(savedContact)
        })
        .catch(error => next(error))
})

app.put(`${contactsPath}/:id`, (req, res, next) => {
    const {name, number} = req.body
    console.log(name, number)

    Contact.findByIdAndUpdate(
        req.params.id,
        {name, number},
        {new: true, runValidators: true, context: 'query'}
    )
        .then(updatedContact => {
            if (!updatedContact) throw {name: 'MissingIdError'}

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
    Contact.countDocuments({})
        .then(count => {
            res.send(`Phonebook has info for ${count} people<br/>${new Date()}`)
        })
})

app.use((req, res) => res.status(404).end())

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError' || error.name === 'MissingIdError') {
        return res.status(400).json({error: 'malformed id'})
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({name: error.name, message: error.message})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})