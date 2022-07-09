var express = require('express');
const async = require('hbs/lib/async');
const { route } = require('.');

var router = express.Router();
var helper = require('../helper/func')

function verify(req, res, next) {
  if (req.session.adminLog) {
    next()
  }
  else {
    res.redirect('/admin')
  }
}





/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.adminLog) {
    res.redirect('/admin/AdminPanel')
  }
  else {
    res.render('admin/admin-login', { admin: true, index: false, Alert: req.session.err });
    req.session.err = false;
  }

});
Credential = {
  username: "sai",
  Password: 12345
}
router.get('/AdminPanel', async (req, res) => {
  if (req.session.adminLog) {
    let report = await helper.getTotalReport()
    let monthly = await helper.getMonthReport()
    let ARR = []
    let a = 0;
    for (let k = 0; k < 12; k++) {
      if (monthly[a]) {
        if (monthly[a]._id == k) {
          ARR[k] = monthly[a].total;
          a++
        }
        else {
          ARR[k] = 0;
        }
      }
      else {
        ARR[k] = 0
      }
    }
    let PassARR = [...ARR]
    let Cod = 0;
    let razor = 0
    let paypal = 0
    for (let i of report) {
      if (i._id == 'COD') {
        Cod = i.total
      } else if (i._id == 'paypal') {
        paypal = i.total
      } else {
        razor = i.total
      }
    }
    res.render('admin/index', { admin: true, head: true, index: true, Cod, paypal, razor, monthly, PassARR });
  }
  else {
    res.redirect('/admin')
  }

})
router.post('/Panel', (req, res) => {
  if (req.body.password == Credential.Password && req.body.username == Credential.username) {
    req.session.adminLog = true
    res.redirect('/admin/AdminPanel')
  }
  else {
    req.session.err = "Invalid username or password"
    res.redirect('/admin')
  }
})

router.get('/user-list', verify, (req, res) => {
  helper.getData().then((data) => {
    res.render('admin/user-list', { admin: true, head: true, index: true, data })
  })
})

router.get('/block/:id', verify, (req, res) => {
  let bid = req.params.id
  console.log(bid);
  helper.blockuser(bid).then((data) => {
    res.json({ status: true })

  })
})

router.get('/unblock/:id', verify, (req, res) => {
  let dib = req.params.id
  helper.unblockuser(dib).then((data) => {
    res.json({ status: true })
  })
})

router.get('/products', verify, (req, res) => {
  helper.getProducts().then((products) => {
    helper.getCatog().then((catog) => {
      res.render('admin/products', { products, catog })
    })
  })
})

router.get('/add-products', verify, (req, res) => {
  helper.getCatog().then((catog) => {
    res.render('admin/add-product', { catog })
  })

})

router.post('/add-products', (req, res) => {
  console.log(req.files.image);
  helper.addProducts(req.body).then((id) => {
    let image = req.files.image;
    image.mv('./public/pro-img/' + id + '.jpg', (err, data) => {
      if (!err) {
        res.redirect('/admin/products')
      }
      else {
        console.log(err);
      }
    })
  })
})

router.get('/del-pro/:id', verify, (req, res) => {
  console.log("haiiiiiiiiiii");
  let delpro = req.params.id;
  helper.delProducts(delpro).then((result) => {
    res.json(result)
  })
})

router.get('/edit-pro/:id', verify, (req, res) => {
  let editpro = req.params.id;
  helper.getedit(editpro).then((result) => {
    helper.getCatog().then((catog) => {
      res.render('admin/edit-products', { result, catog })
    })




  })
})

router.get('/edit-img', verify, (req, res) => {
  helper.getedit(editpro).then((result) => {

    res.render('admin/edit-products', { result })
  })
})

router.post('/edit-pro/:id', (req, res) => {
  let editid = req.params.id;
  helper.editProducts(editid, req.body).then((data) => {

    if (req.files != null) {
      let image = req.files.image;
      image.mv('./public/pro-img/' + editid + '.jpg')
      res.redirect('/admin/products')
    }
    else {
      res.redirect('/admin/products')
    }
  })

})

router.get('/Add-catog', verify, (req, res) => {
  res.render('admin/Addcat', { ER: req.session.ErR })
  req.session.ErR = false;
})

router.post('/Add-Catog', (req, res) => {
  helper.checkCat(req.body).then((response) => {
    if (response.got) {
      req.session.ErR = "Catogory Already Exist"
      res.redirect('/admin/Add-catog')
    }
    else {
      helper.catUpdateStatus(req.body.cat).then((response) => {
        helper.AddCatog(req.body).then((data) => {
          res.redirect('/admin/products')
        })
      })

    }
  })

})

router.get('/delcat/:id/:name', (req, res) => {
  let name = req.params.name
  let id = req.params.id
  helper.checkCatEx(name).then((response) => {
    if (response.status) {
      helper.delCatog(id).then((data) => {
        res.redirect('/admin/products')
      })
    }
    else {
      helper.catStatus(name).then(() => {
        helper.delCatog(id).then((data) => {
          res.redirect('/admin/products')
        })
      })


    }

  })

})

router.get('/editcat/:id', verify, (req, res) => {
  helper.geteditcatog(req.params.id).then((data) => {
    res.render('admin/editcat', { data })
  })
})

router.post('/editcat/:id', (req, res) => {
  helper.editcatog(req.params.id, req.body).then((data) => {
    res.redirect('/admin/products')
  })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.orderList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/orderList', verify, (req, res) => {
  helper.getOrderAdmin().then(async (order) => {

    if (req.session.cancel) {
      res.render('admin/orderList', { order, cancel: req.session.cancel })
    }
    else {
      res.render('admin/orderList', { order })

    }
    // let name=await helper.getUser(order.user)
    // console.log(name);


  })

})

router.post('/updateStatus', async (req, res) => {
  console.log('objecttttttttttttttttttttt');
  console.log(req.body);
  let { selected, ID, userID } = req.body
  console.log(selected, ID, userID);

  if (selected == "DELIVERED") {
    let DONE = await helper.Deliver(ID, userID)
    console.log(DONE);

  }


  helper.adminUpdateStatus(selected, ID).then(() => {
    res.json({ status: true })
  })
})
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>cancel>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/cancel/:id', (req, res) => {
  console.log('cancel vanoooooooooo');
  helper.statusUpdate(req.params.id).then((response) => {
    req.session.cancel = true;
    res.json({ status: true })
  })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BANNERS>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/Banner', verify, (req, res) => {

  helper.getBanner().then(async (banner) => {
    let Coupons = await helper.getCoupon()
    res.render('admin/banners2', { banner, Coupons })

  })
})

router.post('/banner_data', (req, res) => {
  console.log('banner came');
  helper.addBanner(req.body).then((id) => {

    console.log(req.files.image);
    let image = req.files.image;
    image.mv('./public/banner_img/' + id + '.jpg', (data,err) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log("successsssssssssssssssss");
        res.redirect('/admin/Banner')
      }
    })
  })
})



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>offers>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/offers', verify, (req, res) => {
  helper.getOffer().then((offer) => {
    res.render('admin/offers', { offer })
  })
})

router.post('/offer', (req, res) => {
  helper.addOffer(req.body).then((offer) => {
    console.log('offer came post');
    res.redirect('/admin/offers')
  })
})

router.get('/applyOffer', verify, (req, res) => {
  helper.getProducts().then((pro) => {
    helper.getOffer().then((offer) => {
      // console.log('checkingggggggggggggggg');
      // console.log(offer);
      res.render('admin/applyoffers', { pro, offer })
    })
  })
})

router.post('/updateOffer/:id', async (req, res) => {
  let offer = req.body.offer
  let value = await helper.getOffervalue(offer)
  helper.updateOffer(req.params.id, value).then((response) => {
    res.redirect('/admin/applyOffer')
  })
})

router.post('/mvOffer/:id', (req, res) => {
  console.log('96325896487////');
  let ID = req.params.id
  helper.rmvOffer(ID).then((removed) => {
    console.log('ajax resssssssssssssssss');
    res.json(removed)
  })
})

router.get('/offerDel/:id', (req, res) => {
  let ID = req.params.id
  helper.delOffer(ID).then((done) => {
    res.redirect('/admin/offers')
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>coupon>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/Coupon', (req, res) => {
  helper.AddCoupon(req.body).then((ADDED) => {
    res.redirect('/admin/Banner')
  })
})
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>report>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/Report', verify, (req, res) => {
  let report = req.session.report
  res.render('admin/report', { report })
})

router.post('/takeReport', (req, res) => {
  let from = new Date(req.body.start)
  let to = new Date(req.body.end)
  let month = to.getMonth()
  console.log(month);
  // let ARR=['jan',"Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"]
  // var A= ARR.at(month);
  // console.log(A);
  helper.getDateReport(from, to).then((report) => {
    // helper.getExact(report).then(())
    req.session.report = report;
    res.redirect('/admin/Report')
  })




})




// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>logout>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/logout', (req, res) => {
  req.session.adminLog = false;
  res.redirect('/admin')
})




module.exports = router;
