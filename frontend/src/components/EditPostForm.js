import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditPostForm({ currentUser }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams(); // Gets post 'id' from URL
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login'); // Kick them out if not logged in
      return;
    }
    
    // Fetch the specific post's data
    axios.get(`http://localhost:8000/blogs/${id}`)
      .then(response => {
        const post = response.data;
        // Auth check
        if (post.creator_user_id !== currentUser.user_id) {
          setError('You are not authorized to edit this post.');
        } else {
          setTitle(post.title);
          setBody(post.body);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load post.');
        setLoading(false);
      });
  }, [id, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/blogs/${id}`, {
        title: title, // Send new title
        body: body,   // Send new body
        user_id: currentUser.user_id // Send user_id for auth
      });
      navigate('/blogs'); // Go back to the blog feed
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update post.');
    }
  };
  
  if (loading) return <p>Loading post...</p>;
  
  if (error) {
    return (
      <>
        <h1>Edit Post</h1>
        <div className="alert alert-danger">{error}</div>
      </>
    );
  }

  return (
    <>
      <h1>Edit Post</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="blogTitle">Blog Title</label>
          <input
            type="text"
            className="form-control"
            id="blogTitle"
            name="blogTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="blogBody">Content</label>
          <textarea
            className="form-control"
            id="blogBody"
            name="blogBody"
            rows="10"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>
    </>
  );
}

export default EditPostForm;