

import React, { useState } from 'react';
import axios from 'axios';


function BlogPostForm({ currentUser, onPostCreated }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const response = await axios.post('http://localhost:8000/blogs', {
        title: title,
        body: body,
        user_id: currentUser.user_id 
      });
      
      onPostCreated(response.data); 
      setTitle(''); 
      setBody('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    }
  };

  return (
    <div className="blogContainer">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="blogTitle">Blog Title</label>
          <input
            type="text"
            className="form-control"
            id="blogTitle"
            placeholder="Enter the title for your blog"
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
            rows="10"
            placeholder="Write your blog post here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit Blog Post</button>
      </form>
    </div>
  );
}

export default BlogPostForm;