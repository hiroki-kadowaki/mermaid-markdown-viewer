const querys = {};
location.search.slice(1).split('&').forEach(p=>{
    const [key, value] = p.split('=');
    if(key) querys[decodeURIComponent(key)] = decodeURIComponent(value);
});

addEventListener('DOMContentLoaded', async()=>{
    document.forms[0].src.value = querys.src || '';
    if(!querys.src) return;

    const nav = document.querySelector('nav');
    const article = document.querySelector('article');
    try{
        const res = await fetch(querys.src);
        article.innerHTML = marked(await res.text());
        for(let el of article.querySelectorAll('[src],[href]')){
            for(let attr of ['src', 'href']){
                if(!el[attr]) continue;
                if(new URL(el[attr], location).origin !== location.origin) continue;
                el[attr] = new URL(el[attr], querys.src).href;
            }
        }

        const listBase = document.createElement('ul');
        let list = listBase;
        let depth = 1;
        let heading_idx = 0;
        for(let h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')){
            const level = parseInt(h.tagName.slice(-1));
            while(depth < level) {
                if(!list.lastChild) list.appendChild(document.createElement('li'));
                const newLevel = document.createElement('ul');
                list.lastChild.appendChild(newLevel);
                list = newLevel;
                depth++;
            }
            while(depth > level) {
                list = list.parentElement.closest('ul');
                depth--;
            }

            heading_idx++;
            if(!h.id) h.id = 'heading-' + heading_idx;
            const anchor = document.createElement('a');
            anchor.innerText = h.innerText;
            anchor.href = '#' + h.id;
            const row = document.createElement('li');
            row.appendChild(anchor);
            list.appendChild(row);
        }

        if(listBase.children.length) nav.appendChild(listBase);
        mermaid.init(null, '.language-mermaid');
    }catch(err){
        article.innerHTML = `<i>${err.message}</i>`;
    }
});

document.addEventListener('scroll', ()=>{
    const nav = document.querySelector('nav');
    nav.style.marginTop = document.documentElement.scrollTop + 'px';
});