const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://localhost:27017/library', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const bookSchema = new mongoose.Schema({
    bookName: String,
    bookAuthor: String,
    bookPages: Number,
    bookPrice: Number,
    bookState: String
});

const Book = mongoose.model('Book', bookSchema);

app.get("/", async(req, res) => {
    try {
        const books = await Book.find({});
        res.render("home", {
            data: books
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.post("/", async(req, res) => {
    const inputBook = req.body;

    const newBook = new Book({
        bookName: inputBook.bookName,
        bookAuthor: inputBook.bookAuthor,
        bookPages: inputBook.bookPages,
        bookPrice: inputBook.bookPrice,
        bookState: "Available"
    });

    try {
        await newBook.save();
        res.redirect("/");
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/issue', async(req, res) => {
    const requestedBookName = req.body.bookName;

    try {
        // Find the book by name and update its state to "Issued"
        const result = await Book.findOneAndUpdate({ bookName: requestedBookName }, { $set: { bookState: "Issued" } }, { new: true });

        if (result) {
            // Send a response indicating successful issue (optional)
            res.status(200).send('Book issued successfully');
        } else {
            // Send a response indicating that the book was not found (optional)
            res.status(404).send('Book not found');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/return', async(req, res) => {
    const requestedBookName = req.body.bookName;

    try {
        // Find the book by name and update its state to "Available"
        const result = await Book.findOneAndUpdate({ bookName: requestedBookName }, { $set: { bookState: "Available" } }, { new: true });

        if (result) {
            // Send a response indicating successful return (optional)
            res.status(200).send('Book returned successfully');
        } else {
            // Send a response indicating that the book was not found (optional)
            res.status(404).send('Book not found');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/delete', async(req, res) => {
    const requestedBookName = req.body.bookName;

    try {
        // Find the book by name and remove it from MongoDB
        const result = await Book.findOneAndDelete({ bookName: requestedBookName });

        if (result) {
            // Send a response indicating successful deletion (optional)
            res.status(200).send('Book deleted successfully');
        } else {
            // Send a response indicating that the book was not found (optional)
            res.status(404).send('Book not found');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.listen(4000, () => {
    console.log("App is running on port 4000");
});