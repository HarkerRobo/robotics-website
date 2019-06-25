# robotics-website

1. [Context & About](#context--about)
2. [Setup](#setup)
    1. [Install mongoDB](#install-mongodb)
    2. [Install Node.js](#install-nodejs)
    3. [Duplicate config.json](#duplicate-configjson)
    4. [Install packages](#install-packages)
    5. [Run the website](#run-the-website)
3. [Folder Navigation](#folder-navigation)
    1. [/models](#models)
    2. [/routers](#routers)
    3. [/static](#static)
    4. [/views](#views)
        1. [/views/pages](#viewspages)
        2. [/views/partials](#viewspartials)
4. [Configuration Values](#configuration-values)
5. [Desired Coding Standard](#desired-coding-standard)

## Context & About
This repository was created in the summer of 2016 by David Melisso to replace the old Harker Robotics website which was made using Wordpress. Although there were multiple robotics websites before that, they were mostly for the Purchase Request system and wiki's. This repository created a combined location for an external website for outreach and an internal website for systems.

The website was updated in the summer of 2019 by Chirag Kaushik with a new design for the external facing website and a member attendence system. 

The website uses [Node.js](https://nodejs.org/en/) for backend and [Bootstrap 3.3](http://getbootstrap.com/docs/3.3/) + [JQuery](http://jquery.com/) for the frontend. More info can be found in [the Setup section](#setup). The new external facing website uses vanilla Javascript and CSS.

The current Director of Application Design (and webmaster) is [Chirag Kaushik](https://github.com/chiragzq). The website can be found at https://robotics.harker.org/.

## Setup
### Install mongoDB
Follow [this tutorial](https://docs.mongodb.com/manual/administration/install-community/) by mongoDB on how to install mongoDB onto your computer. For your reference, mongoDB is the database program used by this repository. Ensure that the `mongod` process is running before starting up the website. The tutorial explains how to run the `mongod` process.

### Install Node.js
First, go to [the Node.js download page](https://nodejs.org/en/download/). You will see two download links, download the one titled "LTS" or "Long Term Solution".

As of January 8, 2018, this program works successfully on versions 7.4.0 and 8.9.0 of Node.js. In the future, this program should be updated to work successfully on future verisons of Node.js. You can check the version of node you are running by entering the command `node -v` into your terminal or command prompt.

### Duplicate config.json
In your file browser (Finder in macOS, File Explorer in Windows), locate the folder of this repository. Within the folder, copy the file `exampleconfig.json` and paste it as `config.json`. In the new file, change the value next to `superadmins` from `webmaster@example.org` to your Harker gmail address. Also, if you wish to run the internal parts of the website (Blog, PR's, etc.), you will have to contact the webmaster for Google API information (specifically, google.clientID and google.secretKey, and the blog API key if you wish to run the blog). The other values of the config file are explained in the [Config section](#config).

### Install packages
In your terminal (or command prompt), [change your working directory (`cd`)](https://en.wikipedia.org/wiki/Cd_(command)) to the folder for this repository. Then, enter the command `npm install`. This uses the [node package manager](https://www.npmjs.com/) to install the packages required to run this program.

### Run the website
With your terminal's working directory still being that of the repository, enter the command `node index.js`. Then, go to `localhost` in your web browser. The website should appear.  

## Folder Navigation
### /models
This folder contains the mongoDB models (using mongoose). [This tutorial](http://mongoosejs.com/docs/models.html) explains how to make models in Node.js using the `mongoose` package.

### /routers
The different express routers. They should be included (using `require`) in `index.js`. [This tutorial](http://expressjs.com/en/guide/routing.html) explains how routing works using the `express` package. Note that we are using routers, so instead of `app` you would use the variable `router`, which should be initialized using `express.Router()`.

If you are solely looking to work on the scouting app, this will either be part of the `member.js` code or be in a new file under `/routers/member/`.

### /static
The static files (images, css files, js files, etc.) which are accessed directly through the website. For example, if a file was placed in `/static/foo/bar/file.txt`, the file could be accessed on your device through `localhost/foo/bar/file.txt`. [This tutorial](http://expressjs.com/en/starter/static-files.html) explains how `express` handles statically served files.

### /views
The `ejs` files which store the front-end (HTML, rendered with `ejs`). Learn more about `ejs` [here](http://ejs.co/).

#### /views/pages
The actual pages that will be rendered and displayed. These files are displayed using `res.render()` in the `/controllers` folder.

Note that the scouting app page will be in `/views/pages/scouting.ejs`.

#### /views/partials
The snippets of HTML (may include `ejs`) which are included in the pages within `/views/pages`. They are included using `<%- include(__base + 'views/partials/example.ejs') %>`, except `example.ejs` would be replaced with the name of the file. This is good for snippets which are repeated, like navbars, footers, and `<head>` content.

## Configuration Values
The config file should be stored as `config.json`. You can copy from the example in `exampleconfig.json`. Make sure you understand how JSON works before manipulating the file. Here are the settings and what they mean:


| Field                   |  Value                                          | Description
|-------------------------|-------------------------------------------------|-------------
| google.clientIDs          | ["[GoogleClientID]"]   | The google client IDs used for "sign in with Google". Ask for it from the webmaster if needed. Only needed if `runInternal` is set to `true`.
| google.displayID   | 0 | The index of the client id in the array google.clientIDs which to use to display on the website
| google.secretKey         | "secret"                                        | The key given by google for "sign in with Google". Ask for it from the webmaster if needed. Only needed if `runInternal` is set to `true`.
| cookie.secret            | "secret"                                        | The secret to use in your cookies. Make sure it has high entropy (very long and random).
| cookie.name              | "Harker1072Robotics"                            | The name of the cookies.
| server.domain                  | "localhost"                                     | The domain that the server is running on. If you are running this on your local machine, "localhost" will do.
| server.production            | false                                           | Whether the server is a production server, meaning it is behind a proxy and being used as the robotics website.
| server.runInternal             | false                                           | Whether to run the /member path (which includes all stuff which is required to login to see, like PR's and the scouting app).
| server.port                    | 3000  | the port to run the system on
| blog.runBlog            | false                                           | Whether to run the blogs with the API or the iframe
| blog.interval           | 10                                              | The interval (in seconds) on which to pull the blog posts from Blogger.
| blog.blogID             | "123456789"                                     | The ID number for the blog. Use [this](http://blogtimenow.com/blogging/find-blogger-blog-id-post-id-unique-id-number/) tutorial to find the ID number of the blog, or ask the webmaster.
| blog.apiKey             | "some-key"                                      | The API key used to access the blog through API. Ask the webmaster if needed.
| database.port           | 27017                                           | The port on which mongoDB runs.
| database.databaseName   | "robotics-website"                              | The name of the database used for this program.
| automail.service        | "gmail"                                         | The name of the service (gmail, exchange, etc.) which hosts the email address used in `automail.auth.user`.
| automail.auth.user      | "email@example.org"                             | The username of said email.
| automail.auth.pass      | "pass"                                          | The password of said email.
| users.superadmins       | ["webmaster@example.org"]                       | The array of google email addresses of the webmasters of the project. Grants special access for testing purposes.

## Desired Coding Standard
(I'll also get back to this later, but make sure to comment the code which is written.)
