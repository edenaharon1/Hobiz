import React, { useState } from "react";
import styles from "./EditPost.module.css";
import axios from "axios";

interface Post {
    _id: string;
    title: string;
    content: string;
    image?: string;
    owner: string;
    likesCount: number;
    likedBy: string[];
    comments: any[];
}

interface EditPostModalProps {
    post: Post;
    onClose: () => void;
    onPostUpdated: (updatedPost: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onPostUpdated }) => {
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    const [image, setImage] = useState<string | File>(post.image || "");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        } else {
            setImage(post.image || "");
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("Token not found");
                return;
            }

            console.log("Post ID:", post._id);
            console.log("Auth Token:", token);

            let requestData: FormData | { title: string; content: string; image?: string };
            const requestHeaders: HeadersInit = {
                Authorization: `Bearer ${token}`,
            };

            if (image instanceof File) {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', content);
                formData.append('image', image);
                requestData = formData;
                requestHeaders['Content-Type'] = 'multipart/form-data';
            } else {
                requestData = {
                    title: title,
                    content: content,
                    // אם לא נבחרה תמונה חדשה, אל תשלח את השדה 'image' כדי לא לדרוס את התמונה הקיימת
                    ...(typeof image === 'string' && image ? { image } : {}),
                };
                requestHeaders['Content-Type'] = 'application/json';
            }

            const response = await axios.put(`http://localhost:3001/posts/${post._id}`, requestData as any, {
                headers: requestHeaders,
            });

            console.log("Post updated:", response.data);
            
            onPostUpdated(response.data);
            onClose();
        } catch (error) {
            console.error("Error updating post:", error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    alert('Post not found');
                }
                if (error.response?.status === 401) {
                    alert('Unauthorized');
                }
            }
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Edit Post</h2>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
                <div>
                    <label htmlFor="imageInput">Choose new image:</label>
                    <input type="file" id="imageInput" onChange={handleImageChange} accept="image/*" />
                    {post.image && typeof post.image === 'string' && !(image instanceof File) && (
                        <p>Current Image: {post.image}</p>
                    )}
                    {image instanceof File && (
                        <p>Selected Image: {image.name}</p>
                    )}
                </div>
                <div className={styles.modalActions}>
                    <button onClick={handleSave} className={styles.saveButton}>Save</button>
                    <button onClick={onClose} className={styles.closeButton}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;