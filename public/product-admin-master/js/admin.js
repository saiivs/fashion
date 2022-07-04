
function Block(id,name){
  alert('ca,meeeeeeeeee')
    
    swal({
        title: "Are you sure to block?",
        text: name,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url:'/admin/block/'+id,
                method:'get',
                success:(response)=>{
                    if(response.status){
                        swal("successfully blocked", {
                            icon: "success",
                           
                          }).then(()=>{
                            location.reload()
                            
                          })
                          
                         
                    }
                }
            })
        
        } else {
          swal("cancelled");
          
        }
      });
     
}
function UnBlock(id,name){
    
    swal({
        title: "Are you sure to Unblock?",
        text: name,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url:'/admin/unblock/'+id,
                method:'get',
                success:(response)=>{
                    if(response.status){
                        swal("successfully Unblocked", {
                            icon: "success",
                           
                          }).then(()=>{
                            location.reload()
                          })
                          
                    }
                }
            })
        
        } else {
          swal("cancelled");
          
        }
      });
     
}
function cancel(id){
    
  swal({
      title: "Are you sure to cancel order?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
          $.ajax({
              url:'/admin/cancel/'+id,
              method:'get',
              success:(response)=>{
                  if(response.status){
                      swal("successfully cancelled The Order", {
                          icon: "success",
                         
                        }).then(()=>{
                          
                          location.href='/admin/orderList'
                         
                         
                          
                        })     
                  }
              }
          })
      
      } else {
        swal("cancelled");  
      }
    }); 
}

function offer(name){
  console.log('h88888888888888888888888888888888');
  console.log(name);
  $.ajax({
    url:'/admin/offerApply/'+name,
    method:'get',
    success:(response)=>{
      alert(response)
    } 
  })
}

function deletePro(id,name){
  swal({
    title: "Are you sure to delete this Product?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete)=>{
    if(willDelete){
      $.ajax({
        url:'/del-pro/'+id,
        method:'get',
        success:(response)=>{
          if(response){
            swal("successfully Deleted  The Product", {
              icon: "success",
             
            }).then(()=>{
              
              location.href='/admin/products' 
            })     
          }
          
        }
      })
    }else {
      swal("cancelled");  
    }
  })
}

function Rmv(id){
  console.log('ajaxxx22222222222xxxxxxxxxxxx');
  console.log(id);
    $.ajax({
      url:'/admin/mvOffer/'+id,
      method:'post',
      success:(response)=>{
        if(response){
          location.reload()
        }
      }
    })
}

function status(selected,ID,userID){
  console.log(selected);
  console.log(ID);
  $.ajax({
      url:'/admin/updateStatus',
      data:{
          selected,ID,userID
      },
      method:'post',
      success:(response)=>{
        if(response){
          location.reload()
        }
         
      }
  
  })
}

window.onload=function(){
  console.log('haiiiiiiiiiiiiiiiii');
  document.getElementById('PDF').addEventListener('click',()=>{
    const pdf=this.document.getElementById('myTable')
    console.log(pdf);
    console.log(window);
    let opt = {
      margin:       1,
      filename:     'Report.pdf',
      image:        { type: 'jpg', quality: 0.98 },
      html2canvas:  { scale: 4 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().from(pdf).set(opt).save();
  }) 
}




// $('#report').submit((e)=>{
//   e.preventDefault()
//   console.log('haiiiiiiiiiiiiiiiiiiiii');
//   $.ajax({
//     url:'/admin/takeReport',
//     data:$('#report').serialize(),
//     method:'post',
//     success:(response)=>{
//       if(response){
//         alert('hai')
//       }
//     }
//   })

// })






