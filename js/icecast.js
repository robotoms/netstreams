const request = require('request');


// search_xiph :: String -> Promise
function search_xiph(search) {
    search = search.split(' ').join('+');
    
    return new Promise( (resolve, reject) => {
        
        var options = {
            method : 'GET',
            url    : 'http://dir.xiph.org/search?search='+search
        }
        
        request(options, (err, res, body) => {
            if(err) reject(err);
            
            resolve( parse_xiph(body) );
        });
    
    });
}

// search_shoutcast :: String -> Promise
function search_shoutcast(search) {
    search = search.split(' ').join('+');
    
    return new Promise( (resolve, reject) => {
    
        var options = {
            method   : 'POST',
            url      : 'https://www.shoutcast.com/Search/UpdateSearch',
            formData : {
                query: search
            }
        }
        
        request(options, (err, res, body) => {
            if(err) reject(err);
            
            var json = JSON.parse(body);
            resolve( parse_shoutcast(json) );
        });
    
    });
}

// parse_xiph :: String -> [JSON]
function parse_xiph(body) {
    var stream_list = [];
    
    body = body.replace(/\n/g, '');
    
    var rows = body.match(/<tr class="row\d+?">.+?<\/tr>/g);
        
    //for(var i = 0; i < 5; i++) {
    for(var i = 0; i < rows.length; i++) {
        var host = 'http://dir.xiph.org';
        
        var [undefined, homepage, name] = rows[i].match(/<span class="name"><a href="(.+?)" onclick=".+?">(.+?)<\/a>/);
        
        var listeners   = rows[i].match(/<span class="listeners">\[(\d+).+?<\/span>/);
        var description = rows[i].match(/<p class="stream-description">(.+?)<\/p>/);
        var playing     = rows[i].match(/<p class="stream-onair"><.+?>.+?<\/.+?>(.+?)<\/p>/);
        var url         = rows[i].match(/.+<a href="(.+?\.m3u)"/);
        
        
        listeners   = listeners   == null ? 'Null'             : listeners[1];
        description = description == null ? 'No description.'  : description[1];
        playing     = playing     == null ? ''                 : playing[1];
        url         = url         == null ? 'Null'             : host + url[1];
        
        
        stream_list.push({
            name        : name.trim(),
            homepage    : homepage.trim(),
            listeners   : listeners.trim(),
            description : description.trim(),
            playing     : playing.trim(),
            url         : url.trim(),
            src         : 'Icecast',
            is_playlist : true
        });
    }
    
    
    return stream_list;
}

// parse_shoutcast :: JSON -> [JSON]
function parse_shoutcast(json) {
    var stream_list = [];
    
    for(var i = 0; i < json.length; i++) {
        stream_list.push({
            name        : json[i].Name,
            listeners   : json[i].Listeners.toString(),
            playing     : json[i].CurrentTrack,
            url         : 'http://yp.shoutcast.com/sbin/tunein-station.m3u?id='+ json[i].ID,
            src         : 'Shoutcast',
            is_playlist : true
        });
    }
    
    return stream_list;
}


module.exports = {
    search_xiph      : search_xiph,
    search_shoutcast : search_shoutcast
}