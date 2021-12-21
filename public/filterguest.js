function filterGuestsByRoomId() {
    //get the id of the selected homeworld from the filter dropdown
    var roomid_filter = document.getElementById('roomid_filter').value
    //construct the URL and redirect to it
    window.location = '/people/filter/' + parseInt(roomid_filter)
}
