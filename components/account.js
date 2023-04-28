var user = null;

function login(username, password, sendResponse){
    var xmlhttp = new XMLHttpRequest();
    var url = "https://pury.fi/site/wp-json/login/patreon";
    var params = 'username='+encodeURIComponent(username)+'&password='+encodeURIComponent(password);
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                let obj = JSON.parse(this.responseText);
                user = new UserAccount(username, password, obj.patreon_tier, obj.patreon_tier_name, obj.permissions);
                browser.storage.sync.set({
                    user: user,
                    username: username,
                    password: password
                }).then(res => {
                    if(obj.login){
                        sendResponse({
                            success: true,
                            username: username,
                            password: password,
                            user: user
                        });
                    }else{
                        sendResponse({
                            success: false,
                            username: username,
                            password: password,
                            user: null
                        });
                    }
                });

            }catch(e){
                browser.storage.sync.set({
                    user: null,
                }).then(res => {
                    sendResponse({
                        success: false,
                        username: username,
                        password: password,
                        user: null
                    });
                });

            }
        }
    };
    xmlhttp.ontimeout = function (e) {
        sendResponse({
            success: false,
            username: username,
            password: password,
            user: null
        });
    };
    xmlhttp.open('POST', url, true);
    xmlhttp.timeout = 5000;
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(params);
}

function refreshLogin(){
    let options_request = browser.storage.sync.get(["username","password","user"]);
    options_request.then((res) => {
        let username = res.username || '';
        let password = res.password || '';
        if(username && password) {
            login(username, password, function(a){
                //log(a);
            });
        }
        return false;
    });
}

function logout(){
    user = null;
    browser.storage.sync.set({
        user: null
    });
    return true;
}

class UserAccount {
    constructor(username, password, patreon_tier, patreon_tier_name, permissions) {
        this.username = username;
        this.password = password;
        this.patreon_tier = patreon_tier;
        this.patreon_tier_name = patreon_tier_name;
        this.permissions = permissions;
        this.timestamp = Date.now();
    }


}