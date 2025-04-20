import React, { useState, useEffect } from 'react';
import styles from './EditProfileModal.module.css';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // הנח שפרטי המשתמש מועברים כ-prop
    onSave: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(user?.image || null);
    const userId = localStorage.getItem('userId'); // קבלת ID המשתמש מה-localStorage
    const authToken = localStorage.getItem('authToken'); // קבלת הטוקן

    useEffect(() => {
        setUsername(user?.username || '');
        setEmail(user?.email || '');
        setImagePreview(user?.image || null);
        setImageFile(null); // איפוס קובץ התמונה בעת פתיחת המודל
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedImage = e.target.files[0];
            setImageFile(selectedImage);
            setImagePreview(URL.createObjectURL(selectedImage));
        }
    };

    const handleSave = async () => {
        console.log('handleSave called');
        if (!userId || !authToken) {
            console.error('User ID or Auth Token not found');
            return;
        }
        console.log('User ID:', userId);
        console.log('Auth Token:', authToken);

        let newImageUrl: string | null = null;

        if (imageFile) {
            const formData = new FormData();
            formData.append('profileImage', imageFile);

            try {
                console.log('Attempting to upload image...');
                const imageResponse = await fetch(`http://localhost:3001/image/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: formData,
                });

                console.log('Image upload response:', imageResponse);

                if (!imageResponse.ok) {
                    const errorData = await imageResponse.json();
                    throw new Error(`Failed to upload image: ${errorData?.message || imageResponse.statusText}`);
                }

                const imageData = await imageResponse.json();
                console.log('Image upload data:', imageData);
                newImageUrl = imageData?.user?.image;
                console.log('Uploaded image URL:', newImageUrl);

            } catch (error) {
                console.error('Error uploading image:', error);
                // החלט כיצד לטפל בשגיאת העלאה (הצגת הודעה למשתמש וכו')
                return; // עצור את השמירה אם העלאת התמונה נכשלה
            }
        }

        const updatedUser = {
            username,
            email,
            image: newImageUrl || user?.image, // השתמש ב-URL החדש אם הועלה, אחרת השתמש בקיים
        };

        console.log('updatedUser:', updatedUser);

        try {
            console.log('Attempting to update user profile...');
            console.log('Auth Token before update request:', authToken);
            console.log('Headers before sending update request:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            });
            const profileResponse = await fetch(`http://localhost:3001/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(updatedUser),
            });

            console.log('Profile update response:', profileResponse);

            if (!profileResponse.ok) {
                const errorData = await profileResponse.json();
                throw new Error(`Failed to update user: ${errorData?.message || profileResponse.statusText}`);
            }

            const updatedUserData = await profileResponse.json();
            console.log('responseData:', updatedUserData);
            onSave(updatedUserData);
            onClose();

        } catch (error) {
            console.error('Error updating user:', error);
            // הצגת הודעת שגיאה למשתמש
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