function updatePerson(gid){
    console.log("update person function")
    console.log(gid)
    $.ajax({
        url: '/people/' + gid,
        type: 'PUT',
        data: $('#update-person').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};