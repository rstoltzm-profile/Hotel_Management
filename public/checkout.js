function confirmation(rid, gid){
    var result = confirm("Are you sure you want to check_out gid " + gid + " from rid " + rid + "?");
    if(result){
        checkOutRidGid(rid, gid)
    }
}

function checkOutRidGid(rid, gid){
    $.ajax({
        url: '/check_in_out/' + rid + '/' + gid,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};