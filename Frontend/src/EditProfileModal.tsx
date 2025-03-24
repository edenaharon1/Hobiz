import React, { useState, useEffect } from 'react';
import styles from './EditProfilemodal.module.css';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // הנח שפרטי המשתמש מועברים כ-prop
    onSave: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(user?.image || null);

    useEffect(() => {
        setUsername(user?.username || '');
        setEmail(user?.email || '');
        setImagePreview(user?.image || null);
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedImage = e.target.files[0];
            setImage(selectedImage);
            setImagePreview(URL.createObjectURL(selectedImage));
        }
    };

    const handleSave = () => {
        const updatedUser = {
            ...user,
            username,
            email,
            image: imagePreview,
        };
        onSave(updatedUser);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Edit Profile</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                {imagePreview && (
                    <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                )}
                <button onClick={handleSave}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default EditProfileModal;