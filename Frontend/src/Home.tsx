import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPosts, Post } from "./Api";
import axios from "axios";
import HomeComponents from './components/homeComponent';
import styles from './components/Home.module.css'; // ייבוא סגנונות
import { FaComment } from 'react-icons/fa'; // ייבוא אייקון התגובה (התקן את הספריה אם לא מותקנת: npm install react-icons)

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
        const checkLikeStatus = async () => {
            if (selectedPost && localStorage.getItem("authToken")) {
                const authToken = localStorage.getItem("authToken");
                try {
                    if (!authToken) {
                        console.error("Auth token is null");
                        return;
                    }
                    const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
                    const userId = decodedToken._id;
    
                    console.log("selectedPost:", selectedPost);
                    console.log("selectedPost.likedBy:", selectedPost.likedBy);
                    console.log("userId:", userId);
    
                    setUserLiked(selectedPost.likedBy.some(id => id === userId)); // שימוש ב-some()
    
                } catch (error) {
                    console.error("Error decoding token:", error);
                    setUserLiked(false);
                }
            } else {
                setUserLiked(false);
            }
        };
    
        checkLikeStatus();
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
                    commentsCount: post.commentsCount, // שמירה של commentsCount אם קיים
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
    
            let imageUrl: string | undefined;
            if (postData.image) {
                const formData = new FormData();
                formData.append("file", postData.image);
    
                const imageResponse = await axios.post("http://localhost:3001/files", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                imageUrl = imageResponse.data.url;
                console.log("Uploaded Image URL:", imageUrl);
            }
    
            const postToSend: {
                title: string;
                content: string;
                owner: any;
                image?: string | null; // Allow null if no image
            } = {
                title: postData.title,
                content: postData.content,
                owner: postData.owner,
                image: imageUrl || null, // Send the imageUrl if available, otherwise null
            };
    
            const response = await axios.post(
                "http://localhost:3001/posts",
                postToSend,
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
            const postResponse = await axios.get(`http://localhost:3001/posts/${post._id}`);
            const postData = postResponse.data;

            const commentsUrl = `http://localhost:3001/comments/post/${post._id}`;
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
                    "http://localhost:3001/comments",
                    { comment: newComment, postId: selectedPost._id, owner: localStorage.getItem("userId") },
                    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` } }
                );

                const newCommentData = response.data;

                // עדכון הפוסט הנבחר עם התגובה החדשה
                setSelectedPost((prevSelectedPost) =>
                    prevSelectedPost
                        ? { ...prevSelectedPost, comments: [...(prevSelectedPost.comments || []), newCommentData] }
                        : null
                );

                // עדכון רשימת הפוסטים כדי לעדכן את ספירת התגובות
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === selectedPost._id
                            ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
                            : post
                    )
                );

                setNewComment("");
            } catch (error) {
                console.error("Error adding comment:", error);
                alert("Failed to add comment");
            }
        }
    };

    const handleLikeClick = async (postId: string) => {
        try {
            const authToken = localStorage.getItem("authToken"); // קבלת טוקן אימות מה-localStorage
            if (!authToken) {
                alert("User is not logged in"); // הצגת התראה אם המשתמש לא מחובר
                return;
            }
            const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
            const userId = decodedToken._id; 

            console.log("User ID from token:", userId); 

            const response = await axios.put(
                `http://localhost:3001/posts/${postId}/like`, // שליחת בקשת PUT לשרת
                {}, // שליחת גוף ריק (אין צורך במידע נוסף)
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`, // הוספת טוקן אימות לכותרות
                    },
                }
            );
    
            console.log("Like API response:", response.data); // הדפסת תגובת ה-API לקונסולה
    
            // עדכון selectedPost (אם קיים)
            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost({
                    ...selectedPost,
                    likesCount: response.data.likesCount,
                    likedBy: response.data.likedBy,
                });
            }
            console.log("selectedPost:", selectedPost);
            console.log("likedPosts:", likedPosts);
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId
                        ? { ...post, likesCount: response.data.likesCount, likedBy: response.data.likedBy }
                        : post
                )
            );
    
            // עדכון likedPosts
            setLikedPosts((prevLikedPosts) => {
                if (prevLikedPosts.includes(postId)) {
                    // אם הפוסט כבר לייקק, הסרת הלייק
                    return prevLikedPosts.filter((id) => id !== postId);
                } else {
                    // אם הפוסט לא לייקק, הוספת לייק
                    return [...prevLikedPosts, postId];
                }
                
            });
        } catch (error) {
            console.error("Error liking post:", error); // הדפסת שגיאה לקונסולה
            alert("Failed to like post"); // הצגת התראה על שגיאה
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