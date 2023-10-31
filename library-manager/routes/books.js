const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize")

// show full list of books
// router.get("/", async (req, res, next) => {
//   // const err = new Error()
//   // err.status = 500
//   // next(err)
//   let pageNum = 2
//   const books = await Book.findAll();
//   res.render("index", { books, title: "Books", pageNum });
// });

router.get("/page/:pageNum", async (req, res, next) => {
  // const err = new Error()
  // err.status = 500
  // next(err)
  let pageNum = +req.params.pageNum
  const booksPerPage = 5
  const books = await Book.findAll({
    order: [["createdAt", "DESC"]],
    limit: booksPerPage,
    offset: booksPerPage * (pageNum - 1)
  })
  res.render("index", { books, title: "Books", pageNum });
});

// {
//   order: [["createdAt", "DESC"]],
//   limit: 5,
//   offset: 5 * (pageNum - 1)
// }

// pagination
router.post("/page/:pageNum", async (req, res) => {
  let pageNum = +req.params.pageNum
  const page = req.body.page
  const booksPerPage = 5
  // const books = await Book.findAll({
  //   order: [["createdAt", "DESC"]],
  //   limit: booksPerPage,
  //   offset: booksPerPage * (pageNum - 1)
  // })
  const totalPages = Math.floor(await Book.count() / booksPerPage)
  if(page === 'previous' && pageNum > 1) {
    pageNum--
  } 
  if (page === 'next' && pageNum <= totalPages) {
    pageNum++
  }
  res.redirect(`/books/page/${pageNum}`)
  // res.render("index", { books, title: "Books", pageNum });
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

// search
router.post("/search", async(req, res) => {
  const searchTerm = req.body.search
  const matchingBooks = await Book.findAll({
    order: [["createdAt", "DESC"]],
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
  if(matchingBooks.length === 0) {
    res.render("search", { books: matchingBooks, noResults: 'No results found' });
  }
  res.render("search", { books: matchingBooks });
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
