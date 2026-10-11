import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Login from './pages/Login/Login'
import Promos from './pages/Promos/Promos'
import Accounts from './pages/Accounts/Accounts'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '')

  const handleLogin = (adminToken) => {
    localStorage.setItem('adminToken', adminToken)
    setToken(adminToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
  }

  if (!token) {
    return (
      <>
        <ToastContainer />
        <Login onLogin={handleLogin} />
      </>
    )
  }

  return (
    <div className='app'>
      <ToastContainer/>
      <Navbar onLogout={handleLogout}/>
      <hr />
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path="/" element={<Navigate to="/list" replace />} />
          <Route path="/add" element={<Add/>}/>
          <Route path="/list" element={<List/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/promos" element={<Promos/>}/>
          <Route path="/accounts" element={<Accounts/>}/>
          <Route path="*" element={<Navigate to="/list" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
