const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

router.get('/', async(req, res) => {
    const books = await Book.findAll();
    res.render('index',  { books })
})

router.get('/new', async(req, res) => {
    res.render('new-book')
})

router.post('/new', async(req, res) => {
    //
})

router.get('/:id', async(req, res) => {
    const id = req.params.id
    const book = await Book.findByPk(id)
    console.log(book)
    res.render('book', { book })
    console.log(book)

})

router.post(':id', async(req, res) => {
    const id = req.params.id
    const book = await Book.findByPk(id)
})

router.post(':id/delete', async(req, res) => {
    const id = req.params.id
    const book = await Book.findByPk(id)
})

module.exports = router;
