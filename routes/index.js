var express = require('express');

const paypal = require('paypal-rest-sdk');
var router = express.Router();
var helper = require('../helper/func');

require('dotenv').config()
// const { getOffer } = require('../helper/func');
let SSID=process.env.serviceID
let ASID=process.env.accountSID
let AUID=process.env.authToken
var client = require('twilio')(ASID, AUID)

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ARl89X7dn6cGfHYbINJntTQHmAwBzBt-9OWU2pBnqd07YLnAYXmbGvMFh8kJbbmhVVTjsvxs6FCTvzbV',
  'client_secret': 'EKzIsIgre162FnRM6J-wd0Tm6SyS00AWUWElZvAkvpvIIoZHOuEZrKSki9D2ii9ou7y2VKqDOfkRQP_N'
});

function verify(req, res, next) {
  if (req.session.logedin) {
    next()
  }
  else {
    res.redirect('/login-user')
  }
}
function ok(req, res, next) {
  if (req.session.logedin) {
    helper.getCount(req.session.user._id).then((count) => {
      req.session.count = count;
      next()
    })
  }
  else {
    next()
  }
}



/* GET home page. */
router.get('/', function (req, res, next) {
  helper.getBanner().then((banner) => {
    if (req.session.logedin) {
      helper.getProducts().then((pro) => {
      helper.getCount(req.session.user._id).then(async (count) => {
        console.log(count);

        let acc = req.session.user
        console.log(count);
        let heartRed = false
        if (req.session.logedin) {

          let ID = await helper.getlistId(req.session.user._id)
          if(ID){
            if (ID.products[0]) {
              heartRed = true
            }
          }
         
        }
        // req.session.count=count
        res.render('user/index', { value: true, user: true, acc, count, banner, heartRed , pro});
        value = false;
      })
    })

    }
    else {
      helper.getProducts().then((pro) => {

        res.render('user/index', { value: true, user: true, pro, banner });
        value = false;

      })
    }
  }).catch(() => {
    res.render('user/error')
  })


}
);

router.get('/shop', ok, function (req, res) {
  console.log(SSID);
  helper.getProducts().then((pro) => {
    helper.getCatog().then(async (catog) => {
      
      let acc = req.session.user
      if (req.session.help) {
        product = req.session.CatShow
      }
      else {
        product = pro
      }
      for(let i of product){
        if(i.offer!=0){
          i.new=i.price-i.offer
        }
        else{
          i.new=false
        }
      }
      console.log(product);
      let heartRed = false
      if (req.session.logedin) {
        let ID = await helper.getlistId(req.session.user._id)
        if(ID){
          if (ID.products[0]) {
            heartRed = true
            let w = ID.products
            for (let i of ID.products) {
              for (let j of product) {
                let a = i.item.toString()
                let b = j._id.toString()
                if (a == b) {
                  j.Red = true;
                }
                else {
                  console.log('not matched');
                }
              }
            }
          }
        }
        }
       
      res.render('user/shop', { valuea: true, user: true, product, acc, count: req.session.count, catog, heartRed});
      req.session.help = false;
      valuea = false;
    }).catch(() => {
      res.render('user/error')
    })
  }).catch(() => {
    res.render('user/error')
  })
});

router.get('/contacts', function (req, res) {
  res.render('user/contact', { valueb: true, user: true });
  valueb = false;
})

router.get('/login-user', (req, res) => {

  if (req.session.logedin) {
    res.redirect('/')
  }
  else {
    res.render('user/login-user', { user: true, eror: req.session.error })
    req.session.error = false;
  }
})

router.post('/login-user', (req, res) => {
  helper.doLogin(req.body).then((response) => {
    if (response.status) {
      if (response.user.status) {
        req.session.user = response.user;
        req.session.logedin = true;
        res.redirect('/')
      }
      else {
        req.session.error = "You are blocked"
        res.redirect('/login-user')
      }

    }
    else {
      req.session.error = "invalid email or password"
      res.redirect('/login-user')
    }

  })
})


// router.get('/add-cart',(req,res)=>{

//   res.render('user/shopping-cart',{count:req.session.count})
// })

router.get('/wishlist', verify, async (req, res) => {
  try {
    let ID = await helper.getlistId(req.session.user._id)
    let heartRed = false;
    if (ID.products[0]) {
      heartRed = true
    }
    res.render('user/wishlist', { user: true, heartRed });
  } catch (e) {
    res.render('user/error')
  }

})

router.get('/signup', (req, res) => {
  res.render('user/user-signup', { user: true, EOR: req.session.preexist });
  req.session.preexist = false;
})

router.get('/otp', (req, res) => {
  if (req.session.ok) {
    res.redirect('/login-user')
  }
  else if (req.session.logedin) {
    res.redirect('/')
  }
  else {
    var num = req.session.phone
    res.render('user/otp-verify', { num, er: req.session.Er_otp, user: true })
    req.session.Er_otp = false
  }


})

router.post('/sign-up', (req, res) => {
  req.session.ok = false;
  helper.checkUser(req.body).then((exist) => {
    if (exist.user) {
      req.session.preexist = "user already exist"
      res.redirect('/signup')
    }
    else {
      if (req.body.username && req.body.email && req.body.phone && req.body.password) {
        var number = req.body.phone
        req.session.phone = req.body.phone
        req.session.userData = req.body
        client.verify.services(SSID).verifications.create({
          to: `+91${number}`,
          channel: "sms",
        }).then((data) => {
          console.log(data);
          console.log("line 40 data");
          res.redirect('/otp')
        })
      }
    }
  }).catch(() => {
    res.render('user/error')
  })


})
router.post('/otp-verify', (req, res) => {
  var otp = req.body.otp
  var number = req.session.phone
  client.verify.services(SSID).verificationChecks.create({
    to: `+91${number}`,
    code: otp,
  }).then((data) => {
    console.log(data.status + "otp status???????")
    if (data.status == 'approved') {
      helper.addData(req.session.userData).then((response) => {
        req.session.ok = true;
        res.redirect('/login-user')
      })
    }
    else {
      req.session.Er_otp = 'invalid otp'
      res.redirect('/otp')
    }
  })
})





// >>>>>>>>>>>>product details>>>>>>>>>>

// router.get('/proDetails/:id',(req,res)=>{
//    console.log(req.params.id)
//    req.session.pro=req.params.id
//   res.redirect('/proo')
// })

router.get('/proDetails/:id', ok, (req, res) => {
  let got = req.params.id
  helper.getedit(got).then((data) => {
    let count = req.session.count
    console.log(data);
    res.render('user/product-detail', { user: true, valuea: true, data, count })
  }).catch(() => {
    res.render('user/error')
  })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Cart details>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/Add-cart/:id', verify, (req, res) => {
  helper.addCart(req.params.id, req.session.user._id).then((data) => {
    console.log("call apii");
    if (data.status) {
      res.json({ status: false })
    }
    else {
      res.json({ status: true })
    }
  }).catch(() => {
    res.render('user/error')
  })
})

router.get('/cart', verify, ok, async (req, res) => {
 
    if (req.session.logedin) {
      let total = await helper.getTotal(req.session.user._id)
      let offer = await helper.getOfferSum(req.session.user._id)
      helper.getCartProd(req.session.user._id).then(async (products) => {
        let preDeduction = total
        total = total - offer;
        let value = 0
        value = await helper.getCouponValue(req.session.user._id)
        console.log();
        if (value) {
          value = (total / 100) * value
          total = total - value
          console.log(total + "sai");
        } else {
          value = 0
        }
        let acc = req.session.user
        console.log("haii");
        res.render('user/shopping-cart', { valuec: true, user: true, acc, products, count: req.session.count, total, offer, preDeduction, value })
      })
    }
    else {
      res.redirect('/login-user')
    }
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>changeQuantity>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/changeQuantity', (req, res) => {
  console.log(req.body);
  helper.changeProQuantity(req.body).then(async (response) => {
    let total = await helper.getTotal(req.session.user._id)
    let offer = await helper.getOfferSum(req.session.user._id)
    let Coupon = await helper.getCouponValue(req.session.user._id)
    if (response.removeProduct) {
      let value = 0
      if (Coupon) {
        let sum = total - offer
        value = (sum / 100) * Coupon
      }
      response.total = total
      response.offer = offer
      response.Coupon = value
      res.json(response)
    } else {
      let value = 0;
      if (Coupon) {
        let sum = total - offer
        value = (sum / 100) * Coupon
      }
      res.json({ total: total, offer: offer, Coupon: value })
    }
  })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>remve from cart>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/removeCart', (req, res) => {
  helper.removeProCart(req.body).then((data) => {
    console.log(data);
    res.json(data)
  })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.filter catagories>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.get('/showCart/:name', (req, res) => {
  let name = req.params.name;
  helper.getCatName(name).then((pro) => {
    req.session.CatShow = pro
    req.session.help = true;
    res.redirect('/shop')
  }).catch(() => {
    res.render('user/error')
  })
})
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>check out>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/check-out', verify, (req, res) => {
  helper.getCartProd(req.session.user._id).then(async (products) => {
    acc = req.session.user
    let total = await helper.getTotal(req.session.user._id)
    let Address = await helper.getSavedAddress(req.session.user._id)
    let offer = await helper.getOfferSum(req.session.user._id)
    let preDeduction = total
    total = total - offer
    let value = 0
    value = await helper.getCouponValue(req.session.user._id)
    console.log();
    if (value) {
      value = (total / 100) * value
      total = total - value
      console.log(total + "sai");
    } else {
      value = 0
    }
    if (total != 0) {
      if (req.session.Address) {
        let radio = req.session.Address
        res.render('user/checkout', { products, user: true, acc, total, Address, radio, offer, value, preDeduction })
      }
      else {
        res.render('user/checkout', { products, user: true, acc, total, Address, offer, value, preDeduction })
      }
    }
    else {
      res.render('user/shopping-cart', { valuec: true, user: true, acc })
    }

  })
})

router.post('/place-order', async (req, res) => {
  console.log("new oneeeeeeeeeeee");
  console.log(req.body);
  let body = req.body
  console.log(req.body);
  if (req.body['savedaddress'] == 'save') {
    helper.saveAddress(req.body)
  }

  let products = await helper.getCartProdList(req.session.user._id)
  let totalPrice = await helper.getTotal(req.session.user._id)
  let offer = await helper.getOfferSum(req.session.user._id)
  totalPrice = totalPrice - offer

  let value = 0
  value = await helper.getCouponValue(req.session.user._id)
  console.log();
  if (value) {
    value = (totalPrice / 100) * value
    totalPrice = totalPrice - value
    console.log(totalPrice + "sai");
  } else {
    value = 0
  }
  if (req.body['radio'] != 'true') {
    console.log(req.body.radio);
    body = await helper.getSavedRAddress(req.body.radio)
    body.paymentMethod = req.body.paymentMethod
  }
  console.log(body);
  helper.placeOrder(body, products, totalPrice, value).then((orderID) => {
    req.session.orderID = orderID
    let confirm = {
      ID: orderID,
      codSuccess: true
    }

    if (req.body['paymentMethod'] == 'COD') {
      res.json(confirm)
    }
    else if (req.body['paymentMethod'] == 'Razor') {
      console.log('ithanooooooooooooooo');
      console.log(totalPrice);
      helper.getRazorPay(orderID, totalPrice).then((response) => {

        response.razorpay = true;
        response.ID = orderID;

        res.json(response)
      })
    }
    else {
      console.log('paypal elseeeeeeeeeeeeeeeeeeeeeee');
      console.log(totalPrice + "heloooooooooo");
      helper.getPayPal(orderID, totalPrice).then((payment) => {
        req.session.totalpaypal = totalPrice
        payment.ID = orderID;
        res.json(payment)
      })
    }
  })
})

router.get('/confirm', async (req, res) => {
  acc = req.session.user
  let ID = req.session.orderID
  let products = await helper.getorderProd(ID)
  let offer = await helper.getOfferSum(req.session.user._id)
  if (req.session.usedCoupon) {
    let a = await helper.addUsedCoupon(req.session.usedCoupon, req.session.user._id)
    req.session.usedCoupon = false;
  }
  let address = products.slice(0, 1)
  console.log(address);
  res.render('user/confirm', { user: true, acc, products, address, offer })
  helper.removeCart(req.session.user._id)
})


router.post('/radioAddress', (req, res) => {
  req.session.Address = req.body;
  res.redirect('/check-out')
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>profile>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/profile', verify, (req, res) => {
  if (req.url == '/profile') {
    helper.getprofile(req.session.user._id).then(async (profile) => {
      let order = await helper.getOrderHistory(req.session.user._id)
      acc = req.session.user
      res.render('user/profile', { user: true, profile, order, acc })
    })
  } else {
    res.send("error page found")
  }
})

router.get('/profileAddress',(req,res)=>{
  helper.getAddressProfile(req.session.user._id).then((data)=>{
    res.render('user/addressView',{data,user: true, acc })
  })
})

router.post('/takeAddress',(req,res)=>{
  helper.updateAddress(req.body).then((data)=>{
    res.json({status:true})
  })
})



// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.wishList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/wishlist/:id',(req, res) => {

    let id = req.params.id
  let user = req.session.user._id
  console.log('nextObneeeeeeeeeeeeee');
  helper.AddWishList(id, user).then(async (pro) => {
    let ID = await helper.getlistId(req.session.user._id)
    let count = false
    console.log(ID.products[0]);

    if (ID.products[0]) {
      console.log('wish emptyyyyyyyyyyy');
      count = true;
    }
    if (pro.exist) {
      res.json({ status: true, count })
    }
    else {
      res.json({ status: false, count })
    }
  })
  
  
})

router.get('/wishlistpage', verify, ok, (req, res) => {
  let user = req.session.user._id
  helper.getWishList(user).then(async (list) => {
    acc = req.session.user
    let count = req.session.count
    res.render('user/wishlist', { list, user: true, acc, count })
  })
})

router.get('/removelist/:id', (req, res) => {
  proID = req.params.id
  userID = req.session.user._id
  helper.removeList(proID, userID)

})

router.get('/CancelList/:id', (req, res) => {
  proID = req.params.id
  userID = req.session.user._id
  helper.removeList(proID, userID).then((response) => {
    res.json({ status: true })
  })

})



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>razorPay>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  helper.verifyPayment(req.body).then((response) => {
    helper.changePaymentStatus(req.body['order[receipt]']).then(async (response) => {
      if (req.session.usedCoupon) {
        let a = await helper.addUsedCoupon(req.session.usedCoupon, req.session.user._id)
        req.session.usedCoupon = false;
      }
      console.log("payment successfull");
      res.json({ status: "true" })
    })
  }).catch((err) => {
    console.log();
    res.json({ status: false, errMsg: '' })
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>paypal>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

router.get('/success', (req, res) => {
  ID = req.session.orderID
  let totalPrice = req.session.totalpaypal
  helper.changePaymentStatus(ID).then((response) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;


    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": totalPrice
        }
      }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.redirect('/confirm');
      }
    });
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.ordercancel userside>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/cancelOrder/:id', (req, res) => {
  helper.statusUpdate(req.params.id).then((response) => {
    res.json({ status: true })
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>changePassword>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

router.post('/changePassword', (req, res) => {
  console.log(req.body);
  helper.checkPassword(req.body, req.session.user._id).then((verify) => {
    if (verify.status) {
      console.log("verifyeddddddddddd");
      res.json(verify)
    }
    else {
      res.json(verify)
    }
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Coupon>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/couponForUser', (req, res) => {
  console.log(req.body);
  let Coupon = req.body.Coupon_Name
  helper.checkCoupon(Coupon, req.session.user._id).then((check) => {
    if (check.status) {
      res.json({ status: true })
    }
    else if (check.notFound) {
      console.log('notfounddddd');
      res.json({ notFound: true })
    }
    else {
      if (check.Expired) {
        res.json({ Expired: true })
      }
      else {
        req.session.usedCoupon = Coupon
        helper.AddCouponCart(req.session.user._id, Coupon).then(async (match) => {
          console.log('sessionaaaaaaaaaaa');
          if (match.equal) {
            res.json(match)
          }
          else if (match.notequal) {
            res.json(match)
          }
          else {
            match.apply = true
            res.json(match)
          }
        })
      }
    }
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>SERACH>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/searchPage', (req, res) => {
  let search = req.query.search
  helper.getSearched(search).then((Pro) => {
    helper.getCatog().then(async (catog) => {
      // let offer=await helper.getOffer()
      let acc = req.session.user
      if (req.session.help) {
        product = req.session.CatShow
      }
      else {
        product = Pro
        console.log(product);
      }
      let heartRed = false
      if (req.session.logedin) {

        let ID = await helper.getlistId(req.session.user._id)
        if (ID.products[0]) {
          heartRed = true
          let w = ID.products
          for (let i of ID.products) {
            for (let j of product) {
              let a = i.item.toString()
              let b = j._id.toString()
              if (a == b) {
                j.Red = true;
              }
              else {
                console.log('not matched');
              }
            }
          }
        }
      }
      res.render('user/shop', { valuea: true, user: true, product, acc, count: req.session.count, catog, heartRed });
      req.session.help = false;
      valuea = false;
    })

  })
})

// router.get('*',(req,res)=>{
//   res.send("")
// })


router.get('/logout', (req, res) => {
  req.session.logedin = false;
  req.session.catShow = false;
  res.redirect('/')
})



module.exports = router;
