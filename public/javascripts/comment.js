/**
 * Created with JetBrains WebStorm.
 * User: B1ackRainFlake
 * Author: Liuchenling
 * Date: 2/24/14
 * Time: 16:19
 */
(function(d){
    Object.prototype.on = function(m, f){
        if(d.addEventListener){
            this.addEventListener(m, f, false);
        }else{
            this.attachEvent(m, f);
        }
    };
    Object.prototype.off = function(m, f){
        if(d.removeEventListener){
            this.removeEventListener(m, f, false);
        }else{
            this.detachEvent(m, f);
        }
    };
    var alt = [
            "名字都不好好填!",
            "检查一下评论内容啦!"
        ],
        v = function(e,c){
            if(c) d.getElementsByTagName("form")[0][e].value = c;
            return d.getElementsByTagName("form")[0][e].value
        },
        addComment = function(r){
            var qzonelogo = "http://33967.vhost52.boxcdn.cn/qzonelogo.php?uin=",
                li = d.createElement("li"),
                div = d.createElement("div"),
                avatar = d.createElement("img"),
                strong = d.createElement("strong"),
                span = d.createElement("span"),
                p = d.createElement("p"),
                clear = d.createElement("div");
            li.id = "div-comment";
            li.className = "comment-cell";
            div.className = "comment-author";
            avatar.className = "avatar";
            avatar.src = qzonelogo + r.qq,
            span.className = "datetime";
            clear.className = "clear";
            p.appendChild(d.createTextNode(r.content));
            strong.appendChild(d.createTextNode(r.name));
            span.appendChild(d.createTextNode(r.time.minute));
            div.appendChild(avatar);
            div.appendChild(strong);
            div.appendChild(span);
            li.appendChild(div);
            li.appendChild(p);
            li.appendChild(clear);
            d.getElementsByTagName("ol")[0].appendChild(li);
            Scroller.goTo($(".comment-list")[0].lastElementChild);
            d.getElementsByTagName("form")[0].reset();
        };


    var replyComment = function(e){
        if(!v("name")){
            return alert(alt[0]);
        }
        if(!v("content")){
            return alert(alt[1]);
        }
        var ajax = new Ajax(),
            postString = "name="+v("name")+"&qq="+v("qq")+"&url="+v("url")+"&content="+v("content");
        ajax.post(location.href, postString, function(res){
            var result = JSON.parse(res);

            if (result.status == 0){
                return console.log(result.info);
            } else if (result.status == 1){
                return addComment(result);
            }
        });
    };
    if($("#submit"))
        $("#submit").on('click', replyComment);
})(document);
