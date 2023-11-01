const express = require("express");
const router = express.Router();
const Book = require("../models").Book;

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
