function confirmation(pid){
    var result = confirm("Are you sure you want to delete pid " + pid + "?");
    if(result){
        deletePackage(pid)
    }
}

function confirmation_gid_to_pid(gid, pid){
    var result = confirm("Are you sure you want to delete pid " + pid + " for gid " + gid + "?");
    if(result){
        deletePidForGid(gid, pid)
    }
}

function deletePackage(pid){
    $.ajax({
        url: '/packages/' + pid,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};

function deletePidForGid(gid, pid){
    $.ajax({
        url: '/packages/' + gid + '/' + pid,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};