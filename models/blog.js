const mongoose = require('../db')

const blogSchema = mongoose.Schema({
  blog_id: {
    type: Number,
    required: true,
  },
  published: {
    type: Date,
    required: true,
  },
  updated: {
    type: Date,
    required: true,
  },
  title: String,
  content: String,
}, { timestamps: true })

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
