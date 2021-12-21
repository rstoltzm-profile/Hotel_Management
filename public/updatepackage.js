function updatePackage(pid){
    $.ajax({
        url: '/packages/' + pid,
        type: 'PUT',
        data: $('#update-package').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};