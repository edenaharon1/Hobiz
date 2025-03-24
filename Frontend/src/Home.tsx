import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPosts, Post } from "./api";
import axios from "axios";
import HomeComponents from './components/homeComponent';
import styles from './components/Home.module.css'; // ייבוא סגנונות

const Home: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [likedPosts, setLikedPosts] = useState<string[]>([]);
    const [userLiked, setUserLiked] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadPosts();
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    useEffect(() => {
        if (selectedPost && localStorage.getItem("authToken")) {
            const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
            setUserLiked(selectedPost.likedBy.includes(userId));
        } else {
            setUserLiked(false);
        }
    }, [selectedPost]);

    const loadPosts = async () => {
        try {
            const data = await fetchPosts();
            if (data) {
                const processedPosts = data.map((post: any) => ({
                    ...post,
                    likesCount: post.likesCount || 0,
                    likedBy: post.likedBy || [],
                    comments: post.comments || [],
                }));
                setPosts(processedPosts as Post[]);
            }
        } catch (error) {
            console.error("Error loading posts:", error);
        }
    };

    const handleCreatePost = async (postData: {
        owner: any;
        title: string;
        content: string;
        image?: File;
    }) => {
        try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                alert("User is not logged in");
                return;
            }
    
            let imageUrl = undefined;
            if (postData.image) {
                const formData = new FormData();
                formData.append("file", postData.image);
    
                const imageResponse = await axios.post("http://localhost:3000/files", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                imageUrl = imageResponse.data.url;
                console.log("Uploaded Image URL:", imageUrl);
            }
    
            const response = await axios.post(
                "http://localhost:3000/posts",
                {
                    title: postData.title,
                    content: postData.content,
                    owner: postData.owner,
                    image: imageUrl,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
    
            console.log("Post creation response:", response.data);
    
            const newPost: Post = response.data;
            setPosts((prevPosts) => [newPost, ...prevPosts]);
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error creating post:", error.response?.data || error);
            alert(`Failed to create post: ${error.response?.data?.message || "Unknown error"}`);
        }
    };

    const handlePostClick = async (post: Post) => {
        try {
            const postResponse = await axios.get(`http://localhost:3000/posts/${post._id}`);
            const postData = postResponse.data;

            const commentsUrl = `http://localhost:3000/comments/post/${post._id}`;
            const commentsResponse = await axios.get(commentsUrl);
            const commentsData = commentsResponse.data;

            if (postData._id) {
                setSelectedPost({
                    ...postData,
                    comments: commentsData.map((comment: any) => ({
                        comment: comment.comment,
                        postId: comment.postId,
                        owner: comment.owner,
                    })),
                    likesCount: postData.likesCount,
                    _id: postData._id,
                });
            } else {
                console.error("Post ID is undefined");
                setSelectedPost(post);
            }
        } catch (error) {
            console.error("Error fetching post details or comments:", error);
            setSelectedPost(post);
        }
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    const handleAddComment = async () => {
        if (newComment.trim() && selectedPost) {
            try {
                const authToken = localStorage.getItem("authToken");
                if (!authToken) {
                    alert("User is not logged in");
                    return;
                }

                const response = await axios.post(
                    "http://localhost:3000/comments",
                    {
                        comment: newComment,
                        postId: selectedPost._id,
                        owner: localStorage.getItem("userId"),
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                setSelectedPost({
                    ...selectedPost,
                    comments: [
                        ...(selectedPost.comments || []),
                        response.data,
                    ],
                });

                setNewComment("");
            } catch (error) {
                console.error("Error adding comment:", error);
                alert("Failed to add comment");
            }
        }
    };

    const handleLikeClick = async (postId: string) => {
        try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                alert("User is not logged in");
                return;
            }

            const response = await axios.put(
                `http://localhost:3000/posts/${postId}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            console.log("Like API response:", response.data); // הוסף log

        if (selectedPost) {
            setSelectedPost({
                ...selectedPost,
                likesCount: response.data.likesCount,
                likedBy: response.data.likedBy,
            });
        }

            if (likedPosts.includes(postId)) {
                setLikedPosts(likedPosts.filter((id) => id !== postId));
            } else {
                setLikedPosts([...likedPosts, postId]);
            }
        } catch (error) {
            console.error("Error liking post:", error);
            alert("Failed to like post");
        }
    };

    return (
        <div className={styles.homeContainer}>
            <HomeComponents
                posts={posts}
                selectedPost={selectedPost}
                username={username}
                newComment={newComment}
                likedPosts={likedPosts}
                isModalOpen={isModalOpen}
                handleLogout={handleLogout}
                handlePostClick={handlePostClick}
                handleCloseModal={handleCloseModal}
                handleLikeClick={handleLikeClick}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                setIsModalOpen={setIsModalOpen}
                handleCreatePost={handleCreatePost}
            />
            {/* כפתור יצירת פוסט */}
            <button className={styles.createPostButton} onClick={() => setIsModalOpen(true)}>
                +
            </button>
        </div>
    );
};

export default Home;