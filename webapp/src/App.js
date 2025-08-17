import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const userId = "YOUR_USER_ID_HERE"; // Replace with logged-in user id

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await axios.get('http://localhost:5000/posts');
    setPosts(res.data);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);
    formData.append('userId', userId);
    await axios.post('http://localhost:5000/posts', formData);
    fetchPosts();
  };

  const handleLike = async (postId) => {
    await axios.post(`http://localhost:5000/like/${postId}`);
    fetchPosts();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>InstaClone</h1>

      <div>
        <input type="file" onChange={e => setImage(e.target.files[0])} />
        <input type="text" placeholder="Caption" onChange={e => setCaption(e.target.value)} />
        <button onClick={handleUpload}>Post</button>
      </div>

      <div>
        {posts.map(post => (
          <div key={post._id} style={{ border: '1px solid gray', margin: '10px 0', padding: '10px' }}>
            <h4>{post.user.username}</h4>
            <img src={`http://localhost:5000/${post.image}`} width="100%" alt="" />
            <p>{post.caption}</p>
            <button onClick={() => handleLike(post._id)}>❤️ {post.likes}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
