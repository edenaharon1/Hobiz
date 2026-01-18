# Hobiz - Connect Through Hobbies

**Hobiz** is a robust Full-Stack social platform designed to bridge the gap between people with shared interests. Built with a modern architecture, it features an interactive AI-powered chat assistant, real-time-like interactions, and a focus on security and scalability.

---

## Key Features

- **AI Hobby Assistant:** A smart chat interface powered by **OpenAI**, providing users with personalized hobby recommendations and real-time guidance.
- **Social Ecosystem:** Full social networking capabilities including creating posts, leaving comments, and engaging with a community of hobbyists.
- **Secure Authentication:** Multi-layered authentication system featuring **Google OAuth 2.0** for seamless social login and **JWT/Bcrypt** for secure local accounts.
- **Interactive Profile Management:** Personalized user profiles with support for image uploads and media handling via **Multer**.
- **Professional API Documentation:** The entire backend is documented with **Swagger**, providing an interactive UI to explore and test API endpoints.

---

##  Tech Stack & Structure

### Frontend
The frontend follows a modular directory structure (Pages & Components):
* **React 19 & TypeScript** - Full type safety for components and state management.
* **Vite** - High-performance build tool for an optimized development workflow.
* **CSS Modules** - Scoped styling for better maintainability.
* **React Router Dom 7** - Modern client-side routing.

### Backend
* **Node.js & Express** - Scalable server architecture.
* **TypeScript** - Strict type-safety across all server-side logic.
* **MongoDB & Mongoose** - Efficient NoSQL database modeling.
* **OpenAI SDK** - Powering the intelligent, real-time chat assistant.
* **Passport.js & JWT** - Secure, industry-standard authentication.

---

## Testing
# Run all integration and unit tests
npm test

# Run specific test suites
npm run testauth    # Authentication & Security
npm run testpost    # Posts & Community Feed
npm run testuser    # User Profiles & Data

## Getting Started
To run the project locally, clone the repository and install dependencies in both the Frontend and Backend folders using npm install.
Set up a .env file in the backend directory with your:
MongoDB URI,
OpenAI API key,
JWT secret
then start each part by running npm run dev in its respective terminal; the server will run on http://localhost:3001 and the client on its default Vite port.
