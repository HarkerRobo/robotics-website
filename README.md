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

The website uses [Node.js](https://nodejs.org/en/) for backend and [Bootstrap 3.3](http://getbootstrap.com/docs/3.3/) + [JQuery](http://jquery.com/) for the frontend. More info can be found in [the Setup section](#setup).

The current VP of Website Design (abbreviated to webmaster) is [David Melisso](https://github.com/DJMCoder). The website can be found at http://robotics.harker.org/.

## Setup
### Install mongoDB
Follow [this tutorial](https://docs.mongodb.com/manual/administration/install-community/) by mongoDB on how to install mongoDB onto your computer. For your reference, mongoDB is the database program used by this repository. Ensure that the `mongod` process is running before starting up the website. The tutorial explains how to run the `mongod` process.

### Install Node.js
First, go to [the Node.js download page](https://nodejs.org/en/download/). You will see two download links, download the one titled "LTS" or "Long Term Solution". 

As of January 8, 2018, this program works successfully on versions 7.4.0 and 8.9.0 of Node.js. In the future, this program should be updated to work successfully on future verisons of Node.js. You can check the version of node you are running by entering the command `node -v` into your terminal or command prompt. 

### Duplicate config.json
In your file browser (Finder in macOS, File Explorer in Windows), locate the folder of this repository. Within the folder, copy the file `exampleconfig.json` and paste it as `config.json`. In the new file, change the value next to `superadmins` from `webmaster@example.org` to your Harker gmail address. Also, if you wish to run the internal parts of the website (Blog, PR's, etc.), you will have to contact the webmaster for Google API information (specifically, googleClientID and googleSecretKey, and the blog API key if you wish to run the blog). The other values of the config file are explained in the [Config section](#config).

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

(I'll get back to this later; if it's important, ask the webmaster.)

## Desired Coding Standard
(I'll also get back to this later, but make sure to comment the code which is written.)
