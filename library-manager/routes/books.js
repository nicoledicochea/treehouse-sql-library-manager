const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize")


const booksPerPage = 5

// show full list of books
// router.get("/", async (req, res, next) => {
//   // const err = new Error()
//   // err.status = 500
//   // next(err)
//   let pageNum = 1
//   const books = await Book.findAll({
//     order: [["createdAt", "DESC"]],
//     limit: booksPerPage,
//   });
//   res.render("index", { books, title: "Books", pageNum });
// });

// router.get("/", async (req, res, next) => {
//   // const err = new Error()
//   // err.status = 500
//   // next(err)
//   let pageNum = +req.params.pageNum
//   const booksPerPage = 5
//   const books = await Book.findAll({
//     order: [["createdAt", "DESC"]],
//     limit: booksPerPage,
//     offset: booksPerPage * (pageNum - 1)
//   })
//   res.render("index", { books, title: "Books", pageNum });
// });

// {
//   order: [["createdAt", "DESC"]],
//   limit: 5,
//   offset: 5 * (pageNum - 1)
// }

router.get("/page/:pageNum", async (req, res) => {
  let pageNum = +req.params.pageNum
  const totalPages = Math.ceil(await Book.count() / booksPerPage)
  if(pageNum < 1) {
    pageNum = 1
  } else if (pageNum > totalPages) {
    pageNum = totalPages
  }
  const books = await Book.findAll({
    order: [["createdAt", "DESC"]],
    limit: booksPerPage,
    offset: booksPerPage * (pageNum - 1)
  })
  res.render("index", { books, title: "Books", pageNum, totalPages });
})

// pagination
// router.post("/page/:pageNum", async (req, res) => {
//   let pageNum = +req.params.pageNum
//   const currentPage = req.body.page
//   const books = await Book.findAll({
//     order: [["createdAt", "DESC"]],
//     limit: booksPerPage,
//     offset: booksPerPage * (pageNum - 1)
//   })
//   const totalPages = Math.ceil(await Book.count() / booksPerPage)
//   if(currentPage === 'previous' && pageNum > 2) {
//     pageNum--
//     console.log(pageNum)
//   } 
//   else if (currentPage === 'next' && pageNum <= totalPages) {
//     pageNum++
//     console.log(pageNum, totalPages)
//   } else return
//   res.render("index", { books, title: "Books", pageNum });
// })

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
  let pageNum = 2
  const matchingBooks = await Book.findAll({
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
  if(matchingBooks.length === 0) {
    res.render("search", { books: matchingBooks, noResults: 'No results found' });
  }
  res.render("search", { books: matchingBooks, pageNum, searchTerm });
})

// pagination search
// router.post("/search/:searchTerm/page/:pageNum", async (req, res) => {
//   let pageNum = +req.params.pageNum
//   let searchTerm = req.params.searchTerm
//   console.log(req.params)
//   const page = req.body.page
  
//   const totalPages = Math.floor(await Book.count() / booksPerPage)
//   if(page === 'previous' && pageNum > 1) {
//     pageNum--
//   } 
//   if (page === 'next' && pageNum <= totalPages) {
//     pageNum++
//   }
//   res.redirect(`/books/search/page/${pageNum}`)
// })


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
