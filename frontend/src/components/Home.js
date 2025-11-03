// Import useRef
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BlogPostForm from './BlogPostForm'; 
import PostList from './PostList'; 
import { useNavigate } from 'react-router-dom';

function Home({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const hasFetched = useRef(false);

  // We are NOT using useCallback anymore.
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/blogs');
      setPosts(response.data);
      setLoading(false);
    } catch (err)
      {
      console.error('Error fetching posts:', err);
      setLoading(false);
    }
  };

 
  useEffect(() => {
    
    if (!currentUser) {
      navigate('/login');
    }

    // 2. If user IS logged in AND we have NOT fetched yet...
    if (currentUser && !hasFetched.current) {
      
      // ...then fetch the posts...
      fetchPosts();
      
    
      hasFetched.current = true;
    }

   
  }, [currentUser, navigate]); 


  
  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };


  const handlePostDeleted = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.blog_id !== postId));
  };
  

  const handleEdit = (postId) => {
    navigate(`/edit/${postId}`);
  };


  if (loading && currentUser) {
    return <p>Loading posts...</p>;
  }


  if (!currentUser) {
    return null; 
  }

  return (
    <div>
      {/* This part from index.ejs */}
      <h1>Create a New Blog Post</h1>
      <BlogPostForm 
        currentUser={currentUser} 
        onPostCreated={handlePostCreated} 
      />

      <hr />

      {/* This part from blogs.ejs */}
      <h1>Blog Feed</h1>
      <p>Welcome, {currentUser.name}!</p>
      <PostList
        posts={posts}
        currentUser={currentUser}
        onEdit={handleEdit}
        onDelete={handlePostDeleted}
      />
    </div>
  );
}

export default Home;