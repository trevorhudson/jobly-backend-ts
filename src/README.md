# Jobly - Backend

Jobly is a full featured job board with authentication. Users can browse and apply to active job listings on a standalone page and use the search filter to find a job. A company list page displays all companies in the DB, and each companies page features a list of all posted jobs.

### [Live demo](https://jobly.demo.trevorhudson.dev)

# Table of Contents
1. [Features](#Features)
2. [Tech stack](#Tech-stack)
3. [Database schema](#Database-schema)
4. [Install](#Install)
5. [Deployment](#Deployment)
6. [Future features](#Future-features)

## Features<a name="Features"></a>:
* Logged out users have the option to sign up for an account. Authentication is manged by the backend.
* Logged in users have access to view companies and jobs, apply for jobs, and the option to update their profile.
* Users can apply and unapply for jobs to keep track of application status.
* Search fields are available for users to filter through companies/jobs.
* Token stored on localStorage so that a user is not automatically logged out upon page refresh.
* Alerts are displayed to the user when signing up for an account and editing the user profile if minimum requirements are not met.

## Tech stack<a name="Tech-stack"></a>:

### Backend ([GitHub Repo](https://github.com/trevorhudson/react-jobly-backend)):
![alt text](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white&style=for-the-badge)
![alt text](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)

### Frontend ([GitHub Repo](https://github.com/trevorhudson/react-jobly-frontend)):
![alt text](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)

### Database Management:
![alt text](https://img.shields.io/badge/-PostgresSQL-4169E1?logo=postgresql&logoColor=white&style=for-the-badge)

### Database Schema<a name="Database-schema"></a>::
![database schema](jobly-schema-diagram.png)

## Install<a name="Install"></a>:

This project uses Node.js for the back-end JavaScript runtime environment. To install the backend dependencies from the package.json file:

    npm install

To start the sever (port 3000):

    npm start

## Deployment<a name="Deployment"></a>:

### Frontend Deployment:

The static front end can be easily deployed via surge.

To install Surge:

    npm install -g surge

To build react app with environmental variables:

    REACT_APP_BASE_URL=YOUR_RENDER_BACKEND_URL npm run build

Now deploy and build your frontend.

    cp build/index.html build/200.html
    surge build

## Future features<a name="Future-features"></a>:
* Live search
* Show a list of companies applied to
* Add edit form for companies
* Add job application forms
