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

    const handleSave = async () => {
        console.log('handleSave called');
        try {
            let imageUrl = imagePreview;
            if (image) {
                imageUrl = await uploadImage(image);
            }
    
            const updatedUser = {
                username,
                email,
                image: imageUrl,
            };
    
            console.log('updatedUser:', updatedUser);
    
            const response = await fetch(`http://localhost:3001/:id`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });
    
            console.log('response:', response);
    
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
    
            const updatedUserData = await response.json();
    
            console.log('responseData:', updatedUserData);
    
            onSave(updatedUserData);
    
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
            // הצגת הודעת שגיאה למשתמש
        }
    };
    
    // פונקציה לדוגמה להעלאת תמונה
    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('http://localhost:3001/file', { // הנח ש-endpoint ההעלאה הוא /upload
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
    
            const data = await response.json();
            return data.url; // החזרת URL של התמונה
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error; // זריקת שגיאה כדי שה-handleSave יוכל לטפל בה
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Edit Profile</h2>

                {imagePreview && (
                    <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                )}

                <div className={styles.fileInputContainer}>
                    <label className={styles.fileInputLabel} htmlFor="profileImage">
                        {imagePreview ? 'Change Profile Picture' : 'Upload Profile Picture'}
                    </label>
                    <input
                        id="profileImage"
                        className={styles.fileInput}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                <input
                    className={styles.input}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className={styles.input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className={styles.buttonContainer}>
                    <button className={`${styles.button} ${styles.saveButton}`} onClick={handleSave}>
                        Save Changes
                    </button>
                    <button className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;