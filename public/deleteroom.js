function confirmation(rid){
    var result = confirm("Are you sure you want to delete rid " + rid + "?");
    if(result){
        deleteRoom(rid)
    }
}

function deleteRoom(rid){
    $.ajax({
        url: '/rooms/' + rid,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};