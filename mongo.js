import mongoose from 'mongoose'

const argumentCount = process.argv.length

if (argumentCount < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fsopen:${password}@fso.jw589vh.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url).catch(error => {
    console.error('failed to connect to mongodb')
    console.error(error)
})

const closeConnection = () => {
    mongoose.connection.close().catch(error => {
        console.error('error while attempting to close connection', error)
    })
}

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

if (argumentCount === 3) {
    Contact.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(contact => {
            console.log(contact.name, contact.number)
        })
    }).finally(() => {
        closeConnection()
    })
} else if (argumentCount === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const contact = new Contact({
        name: name,
        number: number
    })

    contact.save().then(() => {
        console.log('added', name, 'number', number, 'to phonebook')
    }).finally(() => {
        closeConnection()
    })
}
