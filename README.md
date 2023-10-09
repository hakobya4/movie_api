# Movie API
This project is a RESTful API created by Node Js and Express. 
The API holds information regarding movies (genre/director/summary) 
and gives the ability to have users log in, register, add movies to 
the user's favorites list, log out, and delete users. This is in part due to a MongoDB database.

## Objective

To build the server-side component of a “movies” web application. 
The web application will provide users with access to information
about different movies, directors, and genres. Users will be able
to sign up, update their personal information, and create a list
of their favorite movies.

## Table of Contents

- [Features](#Features)
- [Screenshots](#Screenshots)
- [Technical_Requirements](#Technical_Requirements)
- [Dependencies](#Dependencies)
- [Environment](#Environment)
- [User_Stories](#User_Stories)

## Features

- This API returns a list of ALL movies to the user
- This API returns data (summary, genre, director, image URL) about a  single movie by title to the user
- This API returns data about a genre (description of the genre) and director (bio, birth year, death year) by name
- This API allows users to register, update their user info (username, password, email, date of birth), add a movie to their list of favorites, remove a movie from their list of favorites, and to deregister

## Screenshots

<img src ="https://github.com/hakobya4/movie_api/assets/108638724/200eef33-4169-4d43-a846-f0a9998e3cb2" width="600" height="300"/>

## Technical_Requirements

- The API is a Node.js and Express application.
- The API uses REST architecture, with URL endpoints corresponding to the data operations
- The API uses middleware modules, such as body-parser, cors (enable cross-origin resource sharing), morgan (HTTP request logger) and etc.
- The database that this API utilizes is built using MongoDB.
- The business logic of the API is modeled with Mongoose.
- The API provides movie information in JSON format.
- The API has been tested in Postman.
- The API includes user authentication and authorization code.
- The API includes data validation logic.
- The API meets data security regulations.
- The API source code is deployed to a publicly accessible platform like GitHub.
- The API is deployed to Heroku.

## Dependencies

- CORS
- Express.js
- Mongoose
- Morgan
- Passport
- Node.js
- Body Parser

  
