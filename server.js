if (process.env.NODE_SECRET !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
var path = require("path");
const bcrypt = require("bcrypt"); // Import bcrypt package - là thư viện để mã hóa mật khẩu
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const users = []; //danh sách người dùng

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

app.use(express.urlencoded({ extended: false }));

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post(
  "/loginAdmin",
  checkNotAuthenticatedAdmin,
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/loginAdmin",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  // lấy dữ liệu từ trang register
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); //mã hóa mật khẩu
    const secretkey = await req.body.secretkey;
    const userType = await req.body.options;
    if (userType === "Admin" && secretkey === "SECRETKEY") {
      users.push({
        id: Date.now().toString(), //Id từng người là độc nhất, lấy theo Date.now()
        username: req.body.username, //lấy các element theo name
        email: req.body.email,
        password: hashedPassword,
        userType: userType,
      });
      console.log(users); // hiển thị user sau khi đăng ký
      res.redirect("/loginAdmin");
    } else if (userType === "Admin" && secretkey != "SECRETKEY") {
      res.send(
        "<script>alert('Invalid secret key. Please try again.'); window.location='/register';</script>"
      );
    } else {
      users.push({
        id: Date.now().toString(), //Id từng người là độc nhất, lấy theo Date.now()
        username: req.body.username, //lấy các element theo name
        email: req.body.email,
        password: hashedPassword,
        userType: userType,
      });
      res.redirect("/login");
    } //kết quả trả về là trang login
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
});

// Routes
app.get("/", checkAuthenticated, (req, res) => {
  res.render("pages/index.ejs", { name: req.user.username });
});

app.get("/admin", checkAuthenticated, (req, res) => {
  res.render("pages/indexAdmin.ejs", { name: req.user.username });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/loginAdmin", checkNotAuthenticatedAdmin, (req, res) => {
  res.render("loginAdmin.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});
// End routes

app.delete("/logout", (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/register");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

function checkNotAuthenticatedAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/admin");
  }
  next();
}

app.use(express.static(path.join(__dirname, "public")));
app.listen(3000);
