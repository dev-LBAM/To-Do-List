import React, { useRef, useState } from 'react'
import axios from 'axios'
import { Navigate } from 'react-router-dom'


type RegisterProps = {
  showLoginForm: () => void; // Se for uma função sem parâmetros
};

const Register: React.FC<RegisterProps> = ({ showLoginForm }) => {

  // Register states
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [message, setMessage] = useState('')
  const [messageColor, setMessageColor] = useState('')
  const [isButtonDisabled, setButtonDisabled] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const [code, setCode] = useState('')
  //

  // Function to create user
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setButtonDisabled(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (password !== confirmPassword) {
      setMessageColor('red')
      setMessage('Passwords do not match, please try again!')
      setButtonDisabled(false)
      return
    }

    try {
      const response = await axios.post('http://localhost:3333/createuser', {
        Name: name,
        LastName: lastName,
        Email: email,
        Password: password,
        Age: parseInt(age, 10),
        Gender: gender,
      }, { withCredentials: true})
      if (response.data.status === 201) {
        setMessageColor('green')
        setMessage('Registration successful')
        setButtonDisabled(false)
        setCheckEmail(true)
        setCode(response.data.code)
      } else {
        setMessageColor('red')
        setMessage('Email already exists, please try other!')
        setButtonDisabled(false)
      }
    } catch (error) {
      setMessageColor('red')
      setMessage('Server error, try again!')
      setButtonDisabled(false)
    } finally {
      timeoutRef.current = setTimeout(() => {
        setMessage('')
      }, 2000)
    }
  }
  //

  // Redirect to check email
  if (checkEmail) {
    return <Navigate to='/checkemail' state={{ code, name, email }} />
  }

  return (
    <div className="container">
      <form onSubmit={submit}>
        <h2 className="h2">Register</h2>
        <div className="form-group">
          <label htmlFor="firstName" className="label"></label>
          <input
            type="text"
            id="firstName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
            maxLength={Number("250")}
            placeholder="Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName" className="label"></label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="input"
            placeholder="Last Name"
            maxLength={Number("250")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="label"></label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="Email"
            maxLength={Number("250")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="label"></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            placeholder="Password"
            maxLength={Number("250")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword" className="label"></label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input"
            placeholder="Confirm Your Password"
            maxLength={Number("250")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="age" className="label"></label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '')
              if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 150)) {
                setAge(value ? String(parseInt(value, 10)) : '')
              }
            }}
            min="1"
            max="150"
            required
            className="input"
            placeholder="Age"
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender" className="label"></label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="input"
          >
            <option value="" disabled selected>
              Select a gender
            </option>
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        {message && <p className="message-error" style={{ color: messageColor }}>{message}</p>}
        <div className="btn">
        <button type="submit" className="btn-register" disabled={isButtonDisabled}>Confirm</button>
        <button type="button" className="btn-login" onClick={showLoginForm}>Back</button>

        </div>
      </form>
    </div>
  )
}

export default Register
