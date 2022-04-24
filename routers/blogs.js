"use strict";

const express = require("express"),
    router = express.Router(),
    config = require("../config.json"),
    Blog = require("../models/blog"),
    xss = require("xss"),
    request = require("request");

const postsURL =
    "https://www.googleapis.com/blogger/v3/blogs/" +
    config.blog.blogID +
    "/posts?key=" +
    config.blog.apiKey;
console.log();
console.log("[DEBUG] postsURL =", postsURL);
console.log();

function updateBlogsInDatabase() {
    request(postsURL, (error, response, body) => {
        console.log();
        console.log("--- BLOG POSTS REQUEST ---");
        console.log(response.statusCode);
        if (!error && response.statusCode >= 200 && response.statusCode < 400) {
            console.log("Status code: ", response.statusCode);

            let currentPosts = JSON.parse(body).items;
            if (!Array.isArray(currentPosts)) currentPosts = [];
            console.log("Total posts: ", currentPosts.length);

            const promises = [];
            let postsUpdated = 0,
                postsCreated = 0,
                postsDeleted = 0;

            promises.push(
                new Promise((resolve, reject) => {
                    let curIDs = [];
                    for (const curPost of currentPosts) {
                        curIDs.push(curPost.id);
                    }
                    Blog.remove({ blog_id: { $nin: curIDs } })
                        .then((a) => {
                            postsDeleted += a.result.n;
                            resolve();
                        })
                        .catch(reject);
                })
            );

            for (const curPost of currentPosts) {
                const p = new Promise((resolve, reject) => {
                    Blog.findOne({ blog_id: curPost.id })
                        .then((post) => {
                            // post has been created
                            if (post == null) {
                                // post needs to be created in mongodb
                                postsCreated++;
                                Blog.create({
                                    blog_id: curPost.id,
                                    published: curPost.published,
                                    updated: curPost.updated,
                                    title: curPost.title,
                                    content: curPost.content,
                                    author: curPost.author.displayName,
                                })
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch(reject);
                            }

                            // post has been updated
                            else if (
                                new Date(post.updated) <
                                new Date(curPost.updated)
                            ) {
                                // post needs to be updated in mongodb
                                post.updated = curPost.updated;
                                post.title = curPost.title;
                                post.content = curPost.content;
                                post.author = curPost.author.displayName;
                                postsUpdated++;
                                post.save(resolve);
                            }

                            // otherwise the post has not been touched
                            else resolve();
                        })
                        .catch(reject);
                });

                promises.push(p);
            }

            //console.log('[DEBUG] promises', promises)

            Promise.all(promises)
                .then(() => {
                    console.log("Posts created:", postsCreated);
                    console.log("Posts updated:", postsUpdated);
                    console.log("Posts deleted:", postsDeleted);
                    console.log();
                })
                .catch((err) => {
                    console.error("An error has occured:", err);
                    console.log();
                });
        }
    });
}

let interval =
    typeof config.blog.interval !== "undefined" ? config.blog.interval : 10;

if (config.blog.runBlog) setInterval(updateBlogsInDatabase, interval * 1000);

// router.get('/', (req, res) => {
//   Blog.find({}).sort({ createdAt: 'desc' }).limit(20)
//   .then(posts => {
//     res.render('pages/blog', { posts: posts})
//   })
// })

module.exports = router;
