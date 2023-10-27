var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* GET home page. */
router.get('/', async function(req, res, next) {
  // test global error handler
  // const err = new Error()
  // err.status = 500
  // next(err)

  // res.render('index', { title: 'Express' });
  const books = await Book.findAll();
  console.log(books)
  await res.json(books)
  
});

module.exports = router;
