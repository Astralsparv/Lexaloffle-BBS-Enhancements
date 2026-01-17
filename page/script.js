const version="1.1";
const dataUrl=`https://raw.githubusercontent.com/Astralsparv/Lexaloffle-BBS-Enhancements/refs/heads/main/data.json?recache=${Math.random()}`;

async function getJSON(url) {
    let obj = null;
    
    try {
        obj = await (await fetch(url)).json();
        return obj;
    } catch(e) {
        console.error("Fetch error:", e);
        alert("Can't access the database! There may be a new version but we can't check :(")
        return null;
    }
}

async function main(){
    data=await getJSON(dataUrl);
    document.getElementById('as-version').textContent=version;
    if (data!==null){
        document.getElementById('as-latestversion').textContent=data.version;
        var u=data.new;
        document.getElementById('as-updates').innerHTML='';
        for (let i=0; i<u.length; i++){
            document.getElementById('as-updates').innerHTML+=`${u[i]}<br><br>`;
        }
        setTimeout(() => {
            if (data.version!=version){
                alert(`You are on an older version (${version})!\nPlease update to ${data.version}`);
            }
        }, 1000);
    }
}

main();
document.addEventListener('DOMContentLoaded', () => {
    const imagesCheckbox = document.getElementById('images');
    const repliesCheckbox = document.getElementById('replies');
    const emojisCheckbox = document.getElementById('emojis');
    const pingsOption = document.getElementById('pings');
    const htmlHomepage = document.getElementById('htmlHomepage');
    const htmlIMs = document.getElementById('htmlIMs');
    const htmlGeneral = document.getElementById('htmlGeneral');

    
    chrome.storage.sync.get(['images', 'replies', 'emojis','htmlHomepage','htmlIMs','htmlGeneral','pingsIndex','pings'], (data) => {
        imagesCheckbox.checked = data.images || false;
        repliesCheckbox.checked = data.replies || false;
        emojisCheckbox.checked = data.emojis || false;
        htmlHomepage.value = data.htmlHomepage || "";
        htmlIMs.value = data.htmlIMs || "";
        htmlGeneral.value = data.htmlGeneral || "";
        pingsOption.children[data.pingsIndex || 0].selected=true;
    });

    imagesCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ images: imagesCheckbox.checked });
    });
});