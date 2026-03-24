const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
let { books, nextId } = require('../books');

// Validation Rules
const validateIDParam = [param('id').isInt({ gt: 0 }).withMessage('Invalid ID')];
const validateBook = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be positive'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be positive integer')
];

// Middleware to catch validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    next();
};

// Routes
router.get('/', (req, res) => res.json(books)); // READ ALL

router.get('/:id', validateIDParam, handleValidationErrors, (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    book ? res.json(book) : res.status(404).send('Book not found');
});

router.post('/', validateBook, handleValidationErrors, (req, res) => {
    const newBook = { id: nextId++, ...req.body };
    books.push(newBook);
    res.status(201).json(newBook); // CREATE
});

router.put('/:id', validateIDParam, validateBook, handleValidationErrors, (req, res) => {
    const index = books.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Book not found' });
    books[index] = { ...books[index], ...req.body };
    res.json(books[index]); // UPDATE
});

router.delete('/:id', validateIDParam, handleValidationErrors, (req, res) => {
    const index = books.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Book not found" });
    books.splice(index, 1);
    res.sendStatus(204); // DELETE
});

module.exports = router;