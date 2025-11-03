import React, { useState } from 'react';

import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Signin from './components/Signin';
import EditPostForm from './components/EditPostForm';
import MyProfile from './components/MyProfile'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null); 

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      
      <header>
        <nav className="navbar navbar-expand-custom navbar-mainbg">
          <Link className="navbar-brand navbar-logo" to={currentUser ? "/blogs" : "/"}>Blog Central</Link>
          <button className="navbar-toggler" type="button" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <i className="fas fa-bars text-white"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto">
              <div className="hori-selector">
                <div className="left"></div>
              </div>

              {currentUser ? (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/blogs"><i className="far fa-clone"></i>Blog Feed</NavLink>
                  </li>
                  <li className="nav-item">
                   
                    <NavLink className="nav-link" to="/blogs"><i className="far fa-copy"></i>Create Post</NavLink>
                  </li>
                 
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/profile"><i className="far fa-user"></i>My Profile</NavLink>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i>Logout</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/login"><i className="fas fa-sign-in-alt"></i>Login</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/signup"><i className="fas fa-user-plus"></i>Sign Up</NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </header>
      
     
      <main className="container">
        <Routes>
       
          <Route path="/blogs" element={<Home currentUser={currentUser} />} />
          
      
          
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Signin onLogin={handleLogin} />} />
          
          <Route path="/edit/:id" element={<EditPostForm currentUser={currentUser} />} />
          
          <Route path="/profile" element={<MyProfile currentUser={currentUser} />} />

         
          <Route 
            path="/" 
            element={currentUser ? <Navigate to="/blogs" /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>

     
      <footer>
       
      </footer>
    </Router>
  );
}

export default App;