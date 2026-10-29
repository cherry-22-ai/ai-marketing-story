
window.FILM_STREET_ART='assets/images/3ab5f7daff5c7917.png';
window.FILM_EXPLAIN_READY=Promise.all(Object.entries({...window.FILM_EXPLAIN_FRAMES,street:window.FILM_STREET_ART}).map(([key,src])=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve([key,image]);image.onerror=()=>reject(Error('讲解素材加载失败：'+key));image.src=src;}))).then(entries=>{window.FILM_EXPLAIN_ART=Object.fromEntries(entries);});

