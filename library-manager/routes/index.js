var express = require("express");
var router = express.Router();

// redirect home page to main books list
router.get("/", async function (req, res, next) {
  // // test global error handler
  // const err = new Error()
  // err.status = 500
  // next(err)
  res.redirect("/books");
});

module.exports = router;
