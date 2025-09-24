import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
export default function App(){return (<BrowserRouter><div style={{maxWidth:1000, margin:'20px auto', fontFamily:'Arial'}}><h1 style={{textAlign:'center'}}>Smart Attendance</h1><Routes><Route path='/' element={<Login/>}/><Route path='/dashboard' element={<Dashboard/>}/></Routes></div></BrowserRouter>);}