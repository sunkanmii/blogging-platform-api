# Blogging Platform API

This is the backend API for a personal blog built using Node.js and Express.js, with MongoDB Atlas as the database. The API includes JWT-based authentication and role-based authorization, supporting three roles: Admin, Moderator, and User.

**Hosted on Render:** [Blogging Platform API](https://blogging-platform-api-uhuy.onrender.com)

## Technologies Used

* **Backend:**
  * Node.js: JavaScript runtime environment
  * Express.js: Web application framework
  * MongoDB Atlas: NoSQL database
* **Authentication and Authorization:**
  * JSON Web Tokens (JWT): For secure authentication
* **Email:**
  * Nodemailer (for sending account activation and password reset emails)
* **Deployment:**
  * Render (cloud platform for hosting)


## Features

### Actions

**Unauthenticated Users:**

* Can read posts and comments.
* Cannot like/dislike or comment unless logged in.

**Authenticated Users:**

* Can like/dislike posts, comments, and replies.
* Can comment on posts and reply to comments.
* Can update or delete their own account.
* Can view their own profile or other users' profiles.

### Authentication

* JWT-based authentication: Sign up, login, and protected routes.
* Account Activation via Email: Users must activate their account after signing up via an activation email before logging in.
* Forgot Password: Users can reset their password via a reset password email.

## Public API Endpoints

For detailed information about the public API endpoints, please refer to the [API Documentation](publicEndpointsDoc.md).

## Project Setup

### Prerequisites

* Node.js (v14+)
* MongoDB Atlas (or local MongoDB instance)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/AbdallahRdf/blogging-platform-api.git
   ```

2. Install dependencies:

   ```bash
   cd blogging-platform-api
   npm install
   ```

3. Create a `.env` file with the necessary environment variables:

   ```
   PORT=Server_port_number.
   JWT_SECRET_KEY=Secret_key_for_JWT_authentication.
   MONGODB_CONNECTION_STRING=your-mongodb-connection-string
   FRONTEND_URL=URL_of_your_frontend_application_(optional)
   EMAIL_USER=Email_address_for_sending_emails
   EMAIL_APP_PASSWORD=Application_password_for_the_email_account.
   NODE_ENV=development_or_production
   ```

4. Create an initial admin user:

    run the command below to run createAdmin.js script to create an admin user.

   ```bash
   npm run create-admin
   ```

5. Start the development server:

   ```bash
   npm run start:dev
   ```

## Contributing

If you want to contribute to this project, feel free to fork the repo and submit a pull request.
