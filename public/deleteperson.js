function deletePerson(gid){
    console.log(gid)
    $.ajax({
        url: '/people/' + gid,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};