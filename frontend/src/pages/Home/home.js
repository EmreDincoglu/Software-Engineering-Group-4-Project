import "./home.css";
import { loggedInPage } from "../../lib/auth";
import React, { useState, useEffect } from 'react';

function Posts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('post/getAll', {
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

    return (
        <div className="grid-background">
            <div className="posts-container">
                <button onClick={() => window.location.href = '/create-post'}>Make a Post</button>
                <ul>
                    {posts.map((post) => (
                        <li key={post._id} className="post">
                            <h3>{post.desc}</h3>
                            {post.song_id && <p>{post.song_id}</p>}
                            {post.post_image && <img src={post.post_image.url} alt={post.post_image}/>}
                            <p>Likes: {post.likes}</p>
                            <button>Like</button>
                            {/*    put a heart image there*/}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default loggedInPage(Posts);
