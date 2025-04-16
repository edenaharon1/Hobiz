import { ReactNode } from "react";

const API_URL: string = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3001";

interface Post {
    likesCount: ReactNode;
    _id: string;
    title: string;
    content: string;
    owner: string;
    image?: string;
    likes: number;
    liked?: boolean;
    likedBy: string[];
    comments?: string[];
    createdAt?: string;
    updatedAt?: string;
}

async function fetchPosts(): Promise<Post[] | null> {
    console.log("Fetching posts from:", `http://localhost:3001/posts`); 
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3001/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const posts: Post[] = await response.json();
        console.log("Fetched Posts:", posts);
        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return null;
    }
}

async function addPost(formData: FormData): Promise<Post | null> {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/posts`, { // תיקון ה-endpoint
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData, // שליחת FormData במקום JSON
        });

        if (!response.ok) {
            throw new Error(`Failed to add post! Status: ${response.status}`);
        }

        const createdPost: Post = await response.json();
        console.log("Post added:", createdPost);
        return createdPost;
    } catch (error) {
        console.error("Error adding post:", error);
        return null;
    }
}

async function updatePost(postId: string, updatedData: Partial<Post>): Promise<Post | null> {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update post! Status: ${response.status}`);
        }

        const updatedPost: Post = await response.json();
        console.log("Post updated:", updatedPost);
        return updatedPost;
    } catch (error) {
        console.error("Error updating post:", error);
        return null;
    }
}

async function deletePost(postId: string): Promise<boolean> {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete post! Status: ${response.status}`);
        }

        console.log(`Post ${postId} deleted successfully`);
        return true;
    } catch (error) {
        console.error("Error deleting post:", error);
        return false;
    }
}

async function loginWithGoogle(token: string): Promise<{ accessToken: string; refreshToken: string; _id: string } | null> {
    try {
        const response = await fetch(`${API_URL}/auth/google-login`, { // צור נתיב חדש ללוגין עם גוגל
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            throw new Error(`Google login failed! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error logging in with Google:", error);
        return null;
    }
}

export { fetchPosts, addPost, updatePost, deletePost, loginWithGoogle }; // הוסף את הפונקציה החדשה לייצוא

export type { Post };