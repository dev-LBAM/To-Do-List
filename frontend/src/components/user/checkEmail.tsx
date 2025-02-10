import React, { useEffect, useState } from 'react'
import '../../styles/check-in.css'
import axios from 'axios'
import { Navigate, useLocation } from 'react-router-dom'
import {useRef} from 'react'

const CheckEmail = () => {


  // Check Email states
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()
  const { email } = location.state || {}

  const [checkCode, setCheckCode] = useState('')
  const [redirect, setRedirect] = useState(false)
  const [redirectApp, setRedirectApp] = useState(false)
  const [messageColor, setMessageColor] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [authToken, setAuthToken] = useState('')
  //

  // Function to verify if user is logged
  const verifyToken = async () => {
    try {
    const response = await axios.get('http://localhost:3333/auth/verify-token', { withCredentials: true })
    const check = response.data.Checked
    const NameData = response.data.Name
    const LastNameData = response.data.LastName
    setAuthToken(response.data.accessToken)
    setName(`${NameData} ${LastNameData}`)
    
    if(check === true)
    {
      setRedirectApp(true)
    }

    } catch (error) {
    window.location.href="/"
    console.log(error)
    }
}

useEffect(() => {
      verifyToken()
}, [])
//

if(redirectApp === true){
  return <Navigate to='/todolist' state={{ authToken, name}} />
}

  // Function to check email code
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://localhost:3333/auth/email/${checkCode}`);
      if (response.data.status === 200) {
        setRedirect(true);
      } else {
        setMessage('Send the correct code!')
        setMessageColor('red')
      }
    } catch (error) {
      console.log(error);
    }finally {
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  // Function to send check code again
  const sendCodeAgain = async () => {
    try {
      const response = await axios.post('http://localhost:3333/auth/resendCode', { email });
      if (response.data.status === 200) {
        setMessage('Code resend to your email with sucess!')
        setMessageColor('green')
      } else {
      }
    } catch (error) {
      console.error("Error sending the code again", error);
    }finally {
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const logoutUser = async () => {
    try {
      const response = await axios.post('http://localhost:3333/user/logout', {}, { withCredentials: true });
      if (response.data.logout) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  if (redirect) {
    return <Navigate to="/"  />;
  }

  return (
    <div className="container">
      <form onSubmit={submit} className="form-container">
        <h2 className="h2">Confirmation Code</h2>
        <p className="email-info">{email}</p>

        <div className="form-group">
          <p className="instruction">
            We’ve sent a confirmation code to your email. Please enter it below to verify your account.
          </p>

          <input
            type="text"
            id="code"
            value={checkCode}
            onChange={(e) => setCheckCode(e.target.value)}
            required
            className="input"
            placeholder="Enter your confirmation code"
            style={{marginBottom:'0px'}}
          />
        </div>
        {message && <div style={{color: `${messageColor}`, marginTop:'0px'}}>{message}</div>}  
        <div className="btn-group">
          
          <button type="submit" className="btn-check">Check Code</button>
          <button type="button" className="btn-logout" onClick={logoutUser}>Logout</button>
          <button type="button" className="btn-send-again" onClick={sendCodeAgain}>Send Code Again</button>
          
        </div>
      </form>
    </div>
  );
};

export default CheckEmail;
