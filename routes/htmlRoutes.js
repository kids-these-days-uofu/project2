var db = require("../models");
var cheerio = require("cheerio");
module.exports = function(app) {
  app.get("/", function(req, res) {
    if (!req.session.user) {
      db.Post.findAll({
        attributes: ["id", "title", "body", "UserId"],
        include: [
          {
            model: db.Category,
            as: "category",
            required: false,
            attributes: ["id", "category"],
            through: { attributes: [] }
          }
        ]
      }).then(function(dbPost) {
        res.render("posts", {
          post: dbPost
        });
      });
      return;
    }
    db.User.findOne({
      where: {
        id: req.session.user.id
      }
    }).then(function(dbUser) {
      db.Post.findAll({
        attributes: ["id", "title", "body", "UserId"],
        include: [
          {
            model: db.Category,
            as: "category",
            required: false,
            attributes: ["id", "category"],
            through: { attributes: [] }
          }
        ]
      }).then(function(dbPost) {
        dbPost.forEach(function(post) {
          if (req.session.user.id === post.UserId) {
            post.dataValues.belongs = true;
          } else {
            post.dataValues.belongs = false;
          }
        });
        res.render("posts", {
          user: dbUser,
          post: dbPost
        });
      });
    });
  });

  app.get("/posts/:id", function(req, res) {
    db.Post.findOne({
      where: {
        id: req.params.id
      }
    }).then(function(dbpost) {
      res.render("post", {
        user: req.session,
        body: dbpost
      });
    });
  });

  app.get("/editpost/:id", function(req, res) {
      db.Post.findOne({
        where: {
          id: req.params.id
        }
      }).then(function(dbpost) {
        res.render("editpost", {
          user: req.session,
          body: dbpost
        });
      });
  });

  app.get("/register", function(req, res) {
    res.render("register");
  });

  app.get("/profile", function(req, res) {
    if (req.session.user) {
      return res.render("profile", {
        user: req.session
      });
    }
    else {
      return res.redirect('/')
    }
  });

  app.get("/newpost", function(req, res) {
    if (req.session.user) {
      return res.render("newpost", {
        user: req.session
      });
    }
    else {
      return res.redirect('/')
    }
  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
