import { useState, useEffect } from 'react'
import './index.css'
import personService from './services/person'



const Input = (props) => {
  return < input onChange={props.onChange} value={props.value} />
}

const Notification = ({ message }) => {
  console.log(`${message} this is the message`)
  if (message === null) {
    console.log("If is true")
    return null
  }

  if (message.includes("error")) {
    return (
      <div className='error'>
        {message}
      </div>
    )
  }
  return (
    <div className='added'>
      {message}
    </div>
  )
}

const PersonForm = (props) => {

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const message = null


  const addPerson = event => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber,
    }

    console.log(props.persons)
    console.log(newName)

    if (props.persons.map(person => person.name.toLowerCase() == newName.toLowerCase()).includes(true)) {
      const person = props.persons.filter(person => person.name.toLowerCase() == newName.toLowerCase())[0]
      console.log(person)
      if (window.confirm(`${person.name} is already added to phonebook. Do you want to replace the old number with the new one?`)) {
        person.number = newNumber
        personService
          .update(person.id, person)
          .then(personData => {
            props.setPersons(props.persons)
            props.setNote(`${newName} has been updated.`)
            setNewName('')
            setNewNumber('')
            setTimeout(() => {
              props.setNote(null)
            }, 2000)
          })
          .catch(error => {
            props.setNote(
              `Information of '${newName}' has already been removed from server`
            )
            setTimeout(() => {
              props.setNote(null)
            }, 5000)
          })
        personService
          .getAll()
          .then(response => {
            props.setPersons(response)
            console.log(response)
          }
          )
      }

      return
    }

    personService
      .create(personObject)
      .then(personData => {
        props.setNote(`Added ${newName}`)
        setNewName('')
        setNewNumber('')
        props.setPersons(props.persons.concat(personData))
        setTimeout(() => {
          props.setNote(null)
        }, 2000)
      })
      .catch(error => {
        console.log(error)
        props.setNote(`error : ${error.response.data.error}`)
        setTimeout(() => {
          props.setNote(null)
        }, 5000)
      })

  }

  return <form onSubmit={addPerson}>
    <div>
      name: <Input onChange={(event) => setNewName(event.target.value)} value={newName} />
    </div>
    <div>number: <Input onChange={(event) => setNewNumber(event.target.value)} value={newNumber} /></div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
}

const Content = (props) => {
  const parts = props.persons
  const Part = (props) => {
    const part = props.part

    return (
      <li key={part.id}>
        {part.name} {part.number} <DeleteButton id={part.id} name={part.name} ></DeleteButton>
      </li>
    )
  }

  return (
    <div>
      {parts.map(part => <Part part={part} />)}
    </div>
  )
}

const remove = (id, name) => {
  console.log(name)
  if (window.confirm(`Are you sure you want to delete ${name}`)) {
    personService
      .remove(id)
      .then(response => {
        console.log(response)
      })
  }
}


const DeleteButton = (props) => {
  return <button onClick={() => remove(props.id, props.name)} id={props.id}>Delete</button>
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [searchVal, setSearchVal] = useState('')
  const [noteAdded, setNoteAdded] = useState(null)
  const result = persons.filter(person => person.name.toLowerCase().includes(searchVal.toLowerCase()))

  useEffect(() => {
    console.log('effect')
    personService
      .getAll()
      .then(response => {
        console.log('promise fulfilled')
        setPersons(response)
      })
  }, [])
  console.log('render', persons.length, 'notes')


  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={noteAdded} />
      <PersonForm persons={persons} setPersons={setPersons} setNote={setNoteAdded}></PersonForm>
      <div>
        <h2>Search</h2>
        <div>
          Search: <Input onChange={(event) => setSearchVal(event.target.value)} value={searchVal} />
        </div>
      </div>
      <h2>Numbers</h2>
      <Content persons={result} />
    </div>
  )
}



export default App