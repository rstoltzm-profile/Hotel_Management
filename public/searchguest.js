function searchPeopleByLastName() {
    //get the first name 
    var last_name_search_string  = document.getElementById('last_name_search_string').value
    if (last_name_search_string === ""){
        last_name_search_string = " "
    }
    //construct the URL and redirect to it
    window.location = '/people/search/' + encodeURI(last_name_search_string)
}

function reset_guests() {
    window.location = '/people/'

}
