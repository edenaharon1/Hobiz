import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import CreatePostModal from '../CreatePost';
import { Post } from "../Api"

interface HomeComponentsProps {
    posts: Post[];
    selectedPost: Post | null;
    username: string | null;
    newComment: string;
    likedPosts: string[];
    isModalOpen: boolean;
    handleLogout: () => void;
    handlePostClick: (post: Post) => void;
    handleCloseModal: () => void;
    handleLikeClick: (postId: string) => void;
    setNewComment: (comment: string) => void;
    handleAddComment: () => void;
    setIsModalOpen: (open: boolean) => void;
    handleCreatePost: (postData: { owner: any; title: string; content: string; image?: File }) => void;
}

const HomeComponents: React.FC<HomeComponentsProps> = ({
    posts,
    selectedPost,
    username,
    newComment,
    likedPosts,
    isModalOpen,
    handleLogout,
    handlePostClick,
    handleCloseModal,
    handleLikeClick,
    setNewComment,
    handleAddComment,
    setIsModalOpen,
    handleCreatePost,
}) => {
    return (
        <div className={styles.homeContainer}>
            {/* סרגל ניווט */}
            <div className={styles.navbar}>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Log Out
                </button>
                <Link to="/userprofile" className={styles.profileButton}>
                    Profile
                </Link>
                <span className={styles.username}>
                    {username ? `Hello, ${username}` : "Guest"}
                </span>
            </div>

            {!selectedPost && <h1>Home</h1>} {/* הצגת כותרת רק כאשר לא נבחר פוסט */}

            {/* Display Posts */}
            <div className={styles.postsContainer}>
                {posts.map((post) => (
                    <div key={post._id} className={styles.post} onClick={() => handlePostClick(post)}>
                        <img
                            src={post.image || "./Images/sample.png"}
                            alt="Post"
                            className={styles.postImage}
                            onClick={() => handlePostClick(post)}
                        />
                        <div className={styles.postActions}>
                            <span>{post.likesCount} ❤</span>
                            <span>{post.comments?.length || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Post Details */}
            {selectedPost && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <button onClick={handleCloseModal}>X</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalImageContainer}>
                                <img src={selectedPost.image || "./Images/sample.png"} alt="Post" className={styles.modalImage} />
                                <div className={styles.likes}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill={likedPosts.includes(selectedPost._id) ? "red" : "none"}
                                        stroke="red"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={styles.likeIcon}
                                        onClick={() => handleLikeClick(selectedPost._id)}
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    <span className={styles.likeCount}>{selectedPost.likesCount}</span>
                                </div>
                            </div>
                            <div className={styles.commentsSection}>
                                <h3>{selectedPost.owner}</h3>
                                <h3>{selectedPost.title}</h3>
                                <p>{selectedPost.content}</p>
                                <div className={styles.commentsListContainer}>
                                    <ul className={styles.commentsList}>
                                        {selectedPost?.comments?.map((comment: any, index) => (
                                            <li key={comment._id || index.toString()} className={styles.commentItem}>
                                                {comment.comment}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className={styles.commentInputContainer}>
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                    />
                                    <button onClick={handleAddComment}>Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Post Button */}
            <button className={styles.createPostButton} onClick={() => setIsModalOpen(true)}>
                +
            </button>

            {/* Modal for Creating a Post */}
            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreatePost}
            />
        </div>
    );
};

export default HomeComponents;