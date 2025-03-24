import React, { useState } from "react";
import styles from "./UserProfile.module.css";
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
    
            const response = await axios.put(`http://localhost:3000/posts/${post._id}`, {
                title: title,
                content: content,
                image: typeof image === 'string' ? image : undefined,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
    
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
            {typeof image === "string" ? (
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" />
            ) : (
                <input type="file" onChange={handleImageChange} />
            )}
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
            <div className={styles.modalActions}>
                <button onClick={handleSave} className={styles.saveButton}>Save</button>
                <button onClick={onClose} className={styles.closeButton}>Cancel</button>
            </div>
        </div>
    </div>
);
};

export default EditPostModal;