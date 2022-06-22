function Block(id,name){
    
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

