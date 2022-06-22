var express = require('express');
const async = require('hbs/lib/async');

var router = express.Router();
var helper = require('../helper/func')

function verify(req,res,next){
 if(req.session.adminLog){
  res.redirect('/admin/AdminPanel')
 }
 else{
  next()
 }
}





/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.adminLog){
    res.redirect('/admin/AdminPanel')
  }
  else{
    res.render('admin/admin-login',{admin:true,index:false,Alert:req.session.err});
    req.session.err=false;
  }
  
});
Credential={
  username:"sai",
  Password:12345
}
router.get('/AdminPanel',(req,res)=>{
  if(req.session.adminLog){
    res.render('admin/index',{admin:true,head:true,index:true});
  }
  else{
    res.redirect('/admin')
  }
  
})
router.post('/Panel',(req,res)=>{
  if(req.body.password==Credential.Password&&req.body.username==Credential.username){
    req.session.adminLog=true
    res.redirect('/admin/AdminPanel')
  }
  else{
    req.session.err="Invalid username or password"
    res.redirect('/admin')
  }
})

router.get('/user-list',(req,res)=>{
  helper.getData().then((data)=>{
    res.render('admin/user-list',{admin:true,head:true,index:true,data})
  })
  
})

router.get('/block/:id',(req,res)=>{
  
let bid=req.params.id
console.log(bid);
helper.blockuser(bid).then((data)=>{
  res.json({status:true})
 
})
})

router.get('/unblock/:id',(req,res)=>{
  let dib=req.params.id
  helper.unblockuser(dib).then((data)=>{
    res.json({status:true})
  })
})

router.get('/products',(req,res)=>{
  helper.getProducts().then((products)=>{
    helper.getCatog().then((catog)=>{
  
      
      res.render('admin/products',{products,catog})
    })
   
    
  })
  
})

router.get('/add-products',(req,res)=>{
  helper.getCatog().then((catog)=>{
    
    res.render('admin/add-product',{catog})
  })
  
})

router.post('/add-products',(req,res)=>{
  console.log(req.body);
  console.log(req.files.image);
  helper.addProducts(req.body).then((id)=>{
    let image=req.files.image;
    image.mv('./public/pro-img/'+id+'.jpg',(err,data)=>{
      if(!err){
        res.redirect('/admin/products')
      }
      else{
        console.log(err);
      }
    })
  })  
})

router.get('/del-pro/:id',(req,res)=>{
  let delpro=req.params.id;
  helper.delProducts(delpro).then((result)=>{
    res.redirect('/admin/products')
  })
})

router.get('/edit-pro/:id',(req,res)=>{
  let editpro=req.params.id;
  helper.getedit(editpro).then((result)=>{
   helper.getCatog().then((catog)=>{
    res.render('admin/edit-products',{result,catog})
   })
     
   
    
    
  })
})

router.get('/edit-img',(req,res)=>{
  helper.getedit(editpro).then((result)=>{
    
    res.render('admin/edit-products',{result})
  })
})

router.post('/edit-pro/:id',(req,res)=>{
  let editid=req.params.id;
  helper.editProducts(editid,req.body).then((data)=>{
    
    if(req.files!=null){
      let image=req.files.image;
      image.mv('./public/pro-img/'+editid+'.jpg')
      res.redirect('/admin/products')
    }
    else{
      res.redirect('/admin/products')
    }
  })

})

router.get('/Add-catog',(req,res)=>{
  res.render('admin/Addcat',{ER:req.session.ErR})
  req.session.ErR=false;
})

router.post('/Add-Catog',(req,res)=>{
  helper.checkCat(req.body).then((response)=>{
    if(response.got){
      req.session.ErR="Catogory Already Exist"
      res.redirect('/admin/Add-catog')
    }
    else{
      helper.catUpdateStatus(req.body.cat).then((response)=>{
        helper.AddCatog(req.body).then((data)=>{
          res.redirect('/admin/products')
        })
      })
     
    }
  })
 
})

router.get('/delcat/:id/:name',(req,res)=>{
  let name=req.params.name
  let id=req.params.id
  helper.checkCatEx(name).then((response)=>{
    if(response.status){
      helper.delCatog(id).then((data)=>{
        res.redirect('/admin/products')
      })
    }
    else{
      helper.catStatus(name).then(()=>{
        helper.delCatog(id).then((data)=>{
          res.redirect('/admin/products')
        })
      })
     

    }
   
  })
  
})

router.get('/editcat/:id',(req,res)=>{
  helper.geteditcatog(req.params.id).then((data)=>{
    res.render('admin/editcat',{data})
  })
})

router.post('/editcat/:id',(req,res)=>{
  console.log("haiiiiiiiii");
  
   helper.editcatog(req.params.id,req.body).then((data)=>{
     res.redirect('/admin/products')
   })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.orderList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/orderList',(req,res)=>{
  helper.getOrderAdmin().then(async(order)=>{
    if(req.session.cancel){
      console.log('work anooooooooooo');
      console.log(req.session.cancel);
      res.render('admin/orderList',{order,cancel:req.session.cancel})
      console.log(req.session.cancel);
     // req.session.cancel=false;
    }
    else{
      console.log('ivdeyanooooooooooooooo');
      res.render('admin/orderList',{order})
    }
    // let name=await helper.getUser(order.user)
    // console.log(name);

    
  })
   
})
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>cancel>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/cancel/:id',(req,res)=>{
  console.log('cancel vanoooooooooo');
  helper.statusUpdate(req.params.id).then((response)=>{
    req.session.cancel=true;
    res.json({status:true})
  })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>logout>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/logout',(req,res)=>{
  req.session.adminLog=false;
  res.redirect('/admin')
})




module.exports = router;
