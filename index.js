require('dotenv').config()
const express = require('express')
const app = express()
const time = new Date()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/mongo')
app.use(
  morgan(
    ':method :url :status :response-time ms - :res[content-length] - :body'
  )
)
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

// eslint-disable-next-line
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

let persons = []

app.get('/api/persons/', (request, response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

app.get('/info', (requets, response) => {
  Person.find({}).then((result) => {
    response.send(`Phonebook has info for ${result.length} people <br/>
    ${time.toString()}`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((result) => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
    _id: id,
  })

  Person.findByIdAndUpdate(id, person)
    .then((result) => {
      console.log(result)
      response.json(result)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id)
    .then((result) => {
      console.log(result)
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons/', (request, response, next) => {
  const body = request.body
  console.log(request.body)

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing',
    })
  }
  console.log(persons.map((person) => person.name === body.name).includes(true))
  if (persons.map((person) => person.name === body.name).includes(true)) {
    return response.status(400).json({
      error: 'name must be unique',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((result) => {
      response.json(result)
    })
    .catch((error) => {
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)
// eslint-disable-next-line
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
