import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ToDoList from './components/api/todolist'
import Login from './components/user/login'
import ReactDOM from 'react-dom/client'
import CheckEmail from './components/user/checkEmail';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <Router>
  <Routes>
    <Route path="/checkemail" element={<CheckEmail />} />
    <Route path="/" element={<Login />} />
    <Route path="/todolist" element={<ToDoList />} />
  </Routes>
</Router>
)