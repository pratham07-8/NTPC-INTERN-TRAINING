import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Navbar from './components/Navbar'
import Form from './components/form'
import GuideForm from './components/GuideForm'
import ReviewForm from './components/ReviewForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="w-full"><Home /></div>} />
        <Route path="/TraineeDetails" element={<div className="w-full"><Form /></div>} />
        <Route path="/GuideDetails" element={<div className="w-full"><GuideForm /></div>} />
        <Route path="/Review" element={<div className="w-full"><ReviewForm /></div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

