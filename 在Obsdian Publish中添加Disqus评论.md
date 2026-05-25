---
Status: 🌲
tags:
- note
Links:
- '[[Obsidian]]'
Created: 2024-11-10 19:28:46
Source:
- https://garden.sparrow.zone/Integrating+Comments+in+Obsidian+Publish
share: 'true'
title: 在 Obsidian Publish 中添加 Disqus 评论
---

## 前提
已经设置好[自定义域名](https://help.obsidian.md/Obsidian+Publish/Set+up+a+custom+domain)
## 注册
先要去[Disqus](https://disqus.com/)注册为Publisher
## 创建站点
![](https://publish-01.obsidian.md/access/6a642c14a7329d5cb72168a535b7141d/Media/Image/Pasted%20image%2020231030154737.png)
## 选择通用代码
![](https://publish-01.obsidian.md/access/6a642c14a7329d5cb72168a535b7141d/Media/Image/Pasted%20image%2020231030155412.png)

在这一步得到了disqus的js代码
``` html
<div id="disqus_thread"></div>
<script>
    /**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    /*
    var disqus_config = function () {
    this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    */
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://notes-zool.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
```

## 插入代码
在Valut根目录新建`publish.js`， 将下面的`s.src = 'https://notes-zool.disqus.com/embed.js';`    的disqus-id改为自己的id

``` js
console.log('publish.js loaded');

  

/**

 * Disqus Comment Module

 */

  

/**

 * Resets Disqus with the current page's URL.

 */

function resetDisqus() {

    DISQUS.reset({

        reload: true,

        config: function() {

            this.page.identifier = document.title;

            this.page.url = window.location.origin + window.location.pathname;

        }

    });

}

  

/**

 * Loads Disqus. If Disqus is already loaded, it resets it.

 */

function loadDisqus() {

    if (typeof DISQUS === 'undefined') {

        const disqus_config = function() {

            this.page.identifier = document.title;

            this.page.url = window.location.origin + window.location.pathname;

        };

  

        const d = document;

        const s = d.createElement('script');

        s.src = 'https://notes-zool.disqus.com/embed.js';

        s.setAttribute('data-timestamp', +new Date());

        (d.head || d.body).appendChild(s);

    } else {

        resetDisqus();

    }

}

  

/**

 * Inserts the Disqus comment component into the last mod-footer div.

 */

function insertCommentComponent() {

    const d = document.createElement('div');

    d.id = 'disqus_thread';

  

    const allModFooterDivs = document.querySelectorAll('.mod-footer');

    const lastModFooterDiv = allModFooterDivs[allModFooterDivs.length - 1];

  

    if (lastModFooterDiv) {

        console.log("Found the last mod-footer div!");

        lastModFooterDiv.appendChild(d);

        loadDisqus();

    } else {

        console.log("mod-footer div not found!");

    }

}

  

/**

 * Delays the execution of the insertCommentComponent function.

 */

function delayInsertCommentComponent() {

    setTimeout(insertCommentComponent, 1000);

}

  

// Execute the function once the DOM is loaded

if (document.readyState === "complete" || document.readyState === "interactive") {

    delayInsertCommentComponent();

} else {

    document.addEventListener("DOMContentLoaded", delayInsertCommentComponent);

}

  

// Observe DOM changes and re-insert the Disqus component if it's removed

const observer = new MutationObserver(mutations => {

    for (const mutation of mutations) {

        for (const node of mutation.removedNodes) {

            if (node.nodeType === 1 && node.id === 'disqus_thread') {

                delayInsertCommentComponent();

                break;

            }

        }

    }

});

  

observer.observe(document.body, { childList: true, subtree: true });

  

/**

 * Disqus Comment Module End

 */
```

将js发布出去就好了