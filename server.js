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

app.post("/register", checkNotAuthenticated, async (req, res) => {
  // lấy dữ liệu từ trang register
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); //mã hóa mật khẩu
    users.push({
      id: Date.now().toString(), //Id từng người là độc nhất, lấy theo Date.now()
      username: req.body.username, //lấy các element theo name
      email: req.body.email,
      password: hashedPassword,
    });
    console.log(users); // hiển thị user sau khi đăng ký

    res.redirect("/login"); //kết quả trả về là trang login
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
});

// Routes
app.get("/", checkAuthenticated, (req, res) => {
  res.render("pages/index.ejs", { name: req.user.username });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});
// End routes

app.delete("/logout", (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});


app.get("/resultpage", (req,res) => {
  const danh_sach_ki_thi = {
    1: {
      TenKiThi: "Giữa kì môn Lập trình web",
      Loai: "Tự do",
      danh_sach_cau_hoi: {
        1: {
          de_bai: "Thiết bị hub thông thường nằm ở tầng nào của mô hình OSI?",
          danh_sach_dap_an: {
            A: "Tầng 1",
            B: "Tầng 2",
            C: "Tầng 3",
            D: "Tầng 4",
          },
          dap_an_dung: "A",
        },
        2: {
          de_bai: "Thiết bị hub thông thường nằm ở tầng nào của mô hình OSI?",
          danh_sach_dap_an: {
            A: "Tầng 1",
            B: "Tầng 2",
            C: "Tầng 3",
            D: "Tầng 4",
          },
          dap_an_dung: "A",
        },
        3: {
          de_bai: "Thiết bị hub thông thường nằm ở tầng nào của mô hình OSI?",
          danh_sach_dap_an: {
            A: "Tầng 1",
            B: "Tầng 2",
            C: "Tầng 3",
            D: "Tầng 4",
          },
          dap_an_dung: "A",
        },
      },
    },
  };

  const bai_lam = {
    ma_de: 1,
    phieu_tra_loi: ["A", "B", "B"],
    thoi_gian_lam: "0:22:12",
  };

  res.render("resultpage.ejs", { danh_sach_ki_thi: {
    1: {
      TenKiThi: "Giữa kì môn Lập trình web",
      Loai: "Tự do",
      danh_sach_cau_hoi: {
        1: {
          de_bai: "Thiết bị hub thông thường nằm ở tầng nào của mô hình OSI?",
          danh_sach_dap_an: {
            A: "Tầng 1",
            B: "Tầng 2",
            C: "Tầng 3",
            D: "Tầng 4",
          },
          dap_an_dung: "A",
        },
        2: {
          de_bai: "Thiết bị hub thông thường nằm ở tầng nào của mô hình OSI?",
          danh_sach_dap_an: {
            A: "Tầng 1",
            B: "Tầng 2",
            C: "Tầng 3",
            D: "Tầng 4",
          },
          dap_an_dung: "A",
        },
        3: {
          de_bai: "Thiết bị hub thông thường nằm ở tầng nào của mô hình OSI?",
          danh_sach_dap_an: {
            A: "Tầng 1",
            B: "Tầng 2",
            C: "Tầng 3",
            D: "Tầng 4",
          },
          dap_an_dung: "A",
        },
      },
    },
  }, bai_lam: bai_lam, name: 'Tu' });
});

app.get("/dashboard", (req, res) => {
  const dsKiThi = {
    1: {
      ten: "Giữa kì môn lập trình web 2024",
      soCauHoi: 30,
      ngayThi: "5-5-2023",
      trangThai: "Thời gian cố định",
    },
    2: {
      ten: "Giữa kì môn Triết học 2024",
      soCauHoi: 40,
      ngayThi: "7-6-2023",
      trangThai: "Thời gian cố định",
    },
    3: {
      ten: "Giữa kì môn Cơ sở dữ liệu phân tán",
      soCauHoi: 40,
      ngayThi: "15-6-2023",
      trangThai: "Thời gian cố định",
    },
  };
  
  const dsSinhVien = {
    1: {
      hoten: "Nguyễn Thị Hải",
      msv: "B21DCCN345",
      ml: "D21CQCN02-B",
      ngaysinh: "2003-12-19",
    },
    2: {
      hoten: "Trần Văn An",
      msv: "B21DCCN712",
      ml: "D21CQCN02-B",
      ngaysinh: "1995-06-05",
    },
    3: {
      hoten: "Lê Thị Thu Hương",
      msv: "B21DCCN123",
      ml: "D21CQCN02-B",
      ngaysinh: "2000-09-10",
    },
    4: {
      hoten: "Phạm Minh Tuấn",
      msv: "B21DCCN567",
      ml: "D21CQCN02-B",
      ngaysinh: "1998-03-22",
    },
    5: {
      hoten: "Hoàng Thị Lan Anh",
      msv: "B21DCCN234",
      ml: "D21CQCN02-B",
      ngaysinh: "2001-08-15",
    },
    6: {
      hoten: "Võ Ngọc Duy",
      msv: "B21DCCN890",
      ml: "D21CQCN02-B",
      ngaysinh: "1993-11-03",
    },
    7: {
      hoten: "Mai Văn Hòa",
      msv: "B21DCCN456",
      ml: "D21CQCN02-B",
      ngaysinh: "2002-02-14",
    },
    8: {
      hoten: "Đỗ Thị Kim Chi",
      msv: "B21DCCN789",
      ml: "D21CQCN02-B",
      ngaysinh: "1996-07-28",
    },
    9: {
      hoten: "Nguyễn Minh Quân",
      msv: "B21DCCN321",
      ml: "D21CQCN02-B",
      ngaysinh: "1997-04-09",
    },
    10: {
      hoten: "Trần Thị Quỳnh Trang",
      msv: "B21DCCN654",
      ml: "D21CQCN02-B",
      ngaysinh: "1999-01-12",
    },
  };
  
  res.render("dashboard.ejs", { dsKiThi, dsSinhVien });
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

app.use(express.static(path.join(__dirname, "public")));
app.listen(3000);
