import React, { useState } from 'react';
import styles from './CreatePostModal.module.css';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (postData: { title: string; content: string; owner: string; image?: File; }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | undefined>(undefined);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedImage = e.target.files[0];
            setImage(selectedImage);
            setImagePreview(URL.createObjectURL(selectedImage));
        }
    };

    const handleCreate = () => {
        const owner = localStorage.getItem("userId"); // קבלת userId מה-localStorage
        if (!owner) {
            console.error("User ID not found in localStorage");
            return;
        }
        onCreate({ owner, title, content, image });
        // ניקוי שדות הטופס לאחר יצירה מוצלחת
        setTitle('');
        setContent('');
        setImage(undefined);
        setImagePreview(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>creat new post</h2>
                <input
                    type="text"
                    placeholder="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                {imagePreview && (
                    <img src={imagePreview} alt="תצוגה מקדימה" className={styles.imagePreview} />
                )}
                <button onClick={handleCreate}>צור פוסט</button>
                <button onClick={onClose}>סגור</button>
            </div>
        </div>
    );
};

export default CreatePostModal;