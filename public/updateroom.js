function updateRoom(rid){
    console.log(rid)
    $.ajax({
        url: '/rooms/' + rid,
        type: 'PUT',
        data: $('#update-room').serialize(),
        success: function(response){
            window.location.replace("./");
        }
    })
};