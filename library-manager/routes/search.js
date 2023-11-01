const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize")

// number of books to show for pagination 
const booksPerPage = 5

// redirect empty search string to index
router.get("/",async (req, res) => {
  res.redirect('/')
})

// search books
router.post("/", async(req, res) => {
  const searchTerm = req.body.search
  res.redirect(`/search/${searchTerm}`)
})

// show search results
router.get("/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm
  const pageNum = 1
  const matchingBooks = await Book.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit: booksPerPage,
    where: {
      // from sequelize documentation:
        // [Op.substring]: 'hat',                   
        // LIKE '%hat%'
      [Op.or]: [
        {title: {
          [Op.substring]: searchTerm
        }},
        {author: {
          [Op.substring]: searchTerm
        }},
        {genre: {
          [Op.substring]: searchTerm
        }},
        {year: {
          [Op.substring]: searchTerm
        }}
      ]
    }
  })
  const totalPages = Math.ceil(matchingBooks.count / booksPerPage)
  if(matchingBooks.count === 0) {
    res.render("search", { books: matchingBooks.rows, noResults: 'No results found' });
  } else {
    res.render("search", { books: matchingBooks.rows, searchTerm, pageNum, totalPages });
  }
});

// search listing pagination
router.get("/:searchTerm/page/:pageNum", async (req, res) => {
  const pageNum = +req.params.pageNum
  const searchTerm = req.params.searchTerm
  const matchingBooks = await Book.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit: booksPerPage,
    offset: booksPerPage * (pageNum - 1),
    where: {
      // from sequelize documentation:
        // [Op.substring]: 'hat',                   
        // LIKE '%hat%'
      [Op.or]: [
        {title: {
          [Op.substring]: searchTerm
        }},
        {author: {
          [Op.substring]: searchTerm
        }},
        {genre: {
          [Op.substring]: searchTerm
        }},
        {year: {
          [Op.substring]: searchTerm
        }}
      ]
    }
  })
  const totalPages = Math.ceil(matchingBooks.count / booksPerPage)
  res.render("search", { books: matchingBooks.rows, pageNum, searchTerm, totalPages });
})



module.exports = router;
