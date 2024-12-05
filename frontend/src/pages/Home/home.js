import "./home.css";
import { loggedInPage } from "../../lib/auth";
import React, { useState, useEffect } from 'react';

function Posts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:5000/post/getAll', {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.success) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error("Failed to fetch posts: ", error);
            }
        }
        fetchPosts();
    }, [])

    const handleLike = async (postId) => {
        try {
            const response = await fetch('http://localhost:5000/post/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ post_id: postId }),
            });

            const data = await response.json();
            if (data.success) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId ? { ...post, likes: data.likes } : post
                    )
                );
            } else {
                console.error('Error liking post:', data.error);
            }
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    return (
        <div className="posts-container">
                <button onClick={() => window.location.href = 'create-post'}>Make a Post</button>
            <div>{posts.length === 0 ? (
                <h2>Want to be the first to post?</h2>
            ):(
            <ul>
                {posts.map(post => (
                    <li key={post._id} className="post">
                        <div className="post-song">{post.song && <p>Song: {post.song}</p>}</div>
                        <div className="post-image">{post.image &&
                            <img
                                src={`data:image/jpeg;base64,${post.image}`}
                                alt="Post"
                            />
                        }</div>
                        <div className="post-description">
                            <h3>{post.text}</h3>
                        </div>
                        <button onClick={() => handleLike(post._id)}>
                            {post.liked ? 'Unlike' : 'Like'}
                        </button>
                        <h3>Likes: {post.likes}</h3>
                    </li>
                ))}
            </ul>
            )}</div>
        </div>
    );
}

export default loggedInPage(Posts);
