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
