const express = require("express");
const router = express.Router();
const Book = require("../models").Book;

// show full list of books
router.get("/", async (req, res) => {
  const books = await Book.findAll({
    order: [["createdAt", "DESC"]],
  });
  res.render("index", { books, title: "Books" });
});

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
  const book = await Book.findByPk(id);
  res.render("update-book", { book });
});

// show individual book details
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const book = await Book.findByPk(id);
  res.render("update-book", { book });
});

// update info in database
router.post("/:id", async (req, res) => {
  const id = req.params.id;
  let book = await Book.findByPk(id);
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
  res.redirect("/");
});

module.exports = router;