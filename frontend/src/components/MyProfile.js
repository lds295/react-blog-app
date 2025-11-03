import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

function MyProfile({ currentUser }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if a user is logged in
    if (currentUser) {
      axios.get(`http://localhost:8000/profile/${currentUser.user_id}`)
        .then(response => {
          setProfileData(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
          setLoading(false);
        });
    }
  }, [currentUser]); // This effect runs when the 'currentUser' prop changes

 
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  

  if (loading) {
    return <p>Loading profile...</p>;
  }
  

  if (!profileData) {
    return <p>Could not load profile data.</p>;
  }


  const { name, posts, ...otherInfo } = profileData; 


  return (
    <div>
     
      <div className="card mb-4" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="card-header">
          <h2>My Profile</h2>
        </div>
        <div className="card-body" style={{ textAlign: 'left' }}>
          <h4 className="card-title">{name}</h4>
          <p className="card-text">
            <strong>Username:</strong> {profileData.user_id}
          </p>
          

          {otherInfo.age && <p className="card-text"><strong>Age:</strong> {otherInfo.age}</p>}
          {otherInfo.occupation && <p className="card-text"><strong>Occupation:</strong> {otherInfo.occupation}</p>}
          {otherInfo.city && <p className="card-text"><strong>City:</strong> {otherInfo.city}</p>}
        </div>
      </div>

      <hr />
      
      <h2>My Posts</h2>
      <div className="posts-container">
        {posts && posts.length > 0 ? (
          posts.map(post => (
         
            <article className="post card mb-4" key={post.blog_id}>
              <div className="card-body">
                <h3 className="card-title">{post.title}</h3>
                <p className="card-text">{post.body}</p>
                <div className="post-meta">
                  <small className="text-muted">
                    Posted on: {new Date(post.date_created).toLocaleDateString()}
                  </small>
                </div>
              
              </div>
            </article>
          ))
        ) : (
          <p>You have not created any posts yet.</p>
        )}
      </div>
    </div>
  );
}

export default MyProfile;