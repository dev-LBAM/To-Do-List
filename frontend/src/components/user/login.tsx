import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import '../../styles/login.css'
import Register from './register'
import {Navigate} from 'react-router-dom'

const Login = () => {

  // Login States
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [email, setEmail]= useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageColor, setMessageColor] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [isButtonDisabled, setButtonDisabled] = useState(false)

  const [redirect, setRedirect] = useState(false) 
  const [authToken, setAuthToken] = useState(null)
  const [name, setName] = useState('')
  const [checkEmail, setCheckEmail] = useState(Boolean)
  //

  // Function to verify token and make refresh token
  const verifyToken = async () => {
    try {
      const response = await axios.get('http://localhost:3333/auth/verify-token', { withCredentials: true })
      const token = response.data.accessToken
      const NameData = response.data.Name
      const LastNameData = response.data.LastName
      setName(`${NameData} ${LastNameData}`)
      const Check = response.data.Checked
      if(token && Check)
      {
        setEmail(response.data.Email)
        setName(`${NameData} ${LastNameData}`)
        setAuthToken(token) 
      }
      else{
        setEmail(response.data.Email)
        setCheckEmail(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    verifyToken()
  }, [])
  //

  // Redirect app if email check is true and token is valid
  if (authToken) {
      return <Navigate to='/todolist' state={{ authToken, name}} />
  }

  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
  const passwordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)


  // Verify user exists
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setButtonDisabled(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      const response = await axios.post(
        'http://localhost:3333/finduser',
        { Email: email, Password: password },
        { withCredentials: true }
      )

      if (response.data.status === 200) {
        setButtonDisabled(false)
        setMessageColor('green')
        setMessage('Login sucessful')

        const token = response.data.accessToken
        const NameData = response.data.Name
        const LastNameData = response.data.LastName
        const Check = response.data.Check
        if(Check === false)
        {
          setCheckEmail(true)
        }
        else{
          setName(`${NameData} ${LastNameData}`)
          setAuthToken(token)  
          setRedirect(true) 
        }
      } else {
        setButtonDisabled(false)
        setMessageColor('red')
        setMessage('Email or password incorrect, please try again!')
      }
    } catch (error) {
      setButtonDisabled(false)
      setMessageColor('red')
      setMessage('Server error, please try again!')
    } finally {
      timeoutRef.current = setTimeout(() => {
        setMessage('')
      }, 2000)
    }
  }

  // Redirect if check email is false
  if(checkEmail)
  {
    return <Navigate to="/checkemail" state={{ email }} />
  }

  // Redirect if check email is true and token was authenticated
  if (redirect && authToken) {
    return <Navigate to="/todolist" state={{ authToken, name}} /> 
  }

  // Switch page to register
  const showRegisterForm = () => {
    if (!showRegister) {
      setShowRegister(true)
    }
  }

  // Switch page to login
  const showLoginForm = () => {
    if (showRegister) {
      setShowRegister(false)
    }
  }

  // Redirect to page of register
  if (showRegister) {
    return <Register showLoginForm={showLoginForm} />
  }


  return (
    <div className="container">

      <form onSubmit={submit}>
        <h2 className="h2">Login</h2>
        <div className="form-group">
          <label htmlFor="email" className="label"></label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={emailChange}
            required
            className="input"
            placeholder="Email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="label"></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={passwordChange}
            required
            className="input"
            placeholder="Password"
          />
          {message && <p className="message-error" style={{ color: messageColor }}>{message}</p>}
        </div>
        <div className="btn">
        <button type="submit" className="btn-login"  disabled={isButtonDisabled}>Login</button>
        <button type="button" className="btn-register" onClick={showRegisterForm}>Register</button>
        </div>
      </form>
    </div>
  )
}

export default Login
