const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize")

// number of books to show for pagination 
const booksPerPage = 5

// show books listing
router.get("/", async(req, res) => {
  const pageNum = 1
  const totalPages = Math.ceil(await Book.count() / booksPerPage)
  const books = await Book.findAll({
    order: [["createdAt", "DESC"]],
    limit: booksPerPage
  })
  res.render("index", { books, title: "Books", pageNum, totalPages });
});

// books listing pagination
router.get("/page/:pageNum", async (req, res) => {
  let pageNum = +req.params.pageNum
  const totalPages = Math.ceil(await Book.count() / booksPerPage)
  const books = await Book.findAll({
    order: [["createdAt", "DESC"]],
    limit: booksPerPage,
    offset: booksPerPage * (pageNum - 1)
  })
  res.render("index", { books, title: "Books", pageNum, totalPages });
})

// show create new book form
router.get("/new", (req, res) => {
  res.render("new-book");
});

// post new book to database
router.post("/new", async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect(`/`);
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body)
        res.render('new-book', { book, errors: error.errors })
    } else {
        throw error
    }
  }
});

// search books
router.post("/search", async(req, res) => {
  const searchTerm = req.body.search
  res.redirect(`/books/search/${searchTerm}`)
})

// show search results
router.get("/search/:searchTerm", async (req, res) => {
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
  if(matchingBooks.length === 0) {
    res.render("search", { books: matchingBooks.rows, noResults: 'No results found' });
  }
  res.render("search", { books: matchingBooks.rows, searchTerm, pageNum, totalPages });
});

// search listing pagination
router.get("/search/:searchTerm/page/:pageNum", async (req, res) => {
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


// show individual book details
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const book = await Book.findByPk(id);
  res.render("update-book", { book });
});

// show individual book details
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if(id) {
    const book = await Book.findByPk(id);
    res.render("update-book", { book });
  }
});

// update info in database
router.post("/:id", async (req, res) => {
  const id = req.params.id;
  let book = await Book.findByPk(req.params.id);
  console.log(book)
  try {
    if(book) {
        book = await book.update(req.body);
        res.redirect(`/`);
    } 
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body)
        book.id = id
        res.render('update-book', { book, errors: error.errors })
    } 
  }
});

// delete a book
router.post("/:id/delete", async (req, res) => {
  const id = req.params.id;
  const book = await Book.findByPk(id);
  await book.destroy();
  res.redirect("/");ç
});



module.exports = router;
