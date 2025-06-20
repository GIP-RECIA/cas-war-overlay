function redirectAfterClick() {
    const redirectLink = document.getElementById("customLogoutRedirectButton");
    if(redirectLink){
        setTimeout(function () {
            redirectLink.click();
        }, 2000);
    }
}