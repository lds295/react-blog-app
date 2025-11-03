import React from 'react';
import axios from 'axios';

function PostList({ posts, currentUser, onEdit, onDelete }) {
  
  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8000/blogs/${postId}`, {
          // Send the user_id in the 'data' property for auth
          data: { user_id: currentUser.user_id }
        });
        onDelete(postId); // Tell Home.js to remove it from the list
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete post.');
      }
    }
  };

  return (
    <div className="posts-container">
      {posts.length === 0 ? (
        <p>No blog posts yet. Why not create one?</p>
      ) : (
        posts.map(blog => (
          <article className="post card mb-4" key={blog.blog_id}>
            <div className="card-body">
              <h3 className="card-title">{blog.title}</h3>
              <p className="card-subtitle mb-2 text-muted">By: {blog.creator_name || blog.author_name}</p>
              <p className="card-text">{blog.body}</p>

              <div className="post-meta">
                <small className="text-muted">
                  Posted on: {new Date(blog.date_created).toLocaleDateString()}
                </small>
              </div>

              {/* AUTHORIZATION: Only show actions if the logged-in user is the creator */}
              {currentUser.user_id === blog.creator_user_id && (
                <div className="post-actions mt-3">
                  <button onClick={() => onEdit(blog.blog_id)} className="btn btn-sm btn-secondary">Edit</button>
                  <button onClick={() => handleDelete(blog.blog_id)} className="btn btn-sm btn-danger" style={{ marginLeft: '10px' }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}

export default PostList;