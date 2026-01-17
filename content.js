const availablePings=[

]

let imgs=false;
let replies=false;
let pings=false;
let playPings=true;
let pingSound;

chrome.storage.sync.get(['images', 'replies','pings','pingsIndex'], (settings) => {
  if (settings.images) {
    imgs=true;
  }

  if (settings.replies) {
    replies=true;
  }

  if (settings.pingsIndex && settings.pingsIndex != 0) {
    pings=true;
    if (settings.pings=='silent'){
      playPings=false;
    }else{
      pingSound = new Audio(chrome.runtime.getURL(`data/sounds/notification_im/${settings.pings}.mp3`));
    }
  }
});
console.log('SpaceHey Tweaks is running.\nDeveloped by Astralsparv https://spacehey.com/profile?id=3679346');

function update(){
  let melms;
  // IM msgs
  melms = document.getElementsByClassName('message');
  if (melms.length === 0) return;

  for (let i=0; i<melms.length; i++){
    updMsg(melms[i]);
  }
  firstLoad=true;
}

firstLoad=false;


async function playPing() {
  if (firstLoad) {
    if ((!(document.title.includes('(!)'))) && (!(document.title.includes('(/)')))){
      document.title=`(!) ${document.title}`;
    }
    if (playPings){
      chrome.runtime.sendMessage({ action: "checkTab" }, function (response) {
        if (response && response.play) {
          pingSound.play();
        }
      });
    }
  }
}

setInterval(() => {
  if (document.title.includes('(!)')){
    chrome.runtime.sendMessage({ action: "checkTab" }, function (response) {
      if (response && !(response.play)) {
        document.title=document.title.replace('(!) ','');
      }else{
        document.title=document.title.replace('(!) ','(/) ');
      }
    });
  }else{
    if (document.title.includes('(/)')){
      chrome.runtime.sendMessage({ action: "checkTab" }, function (response) {
        if (response && !(response.play)) {
          document.title=document.title.replace('(/) ','');
        }else{
          document.title=document.title.replace('(/) ','(!) ');
        }
      });
    }
  }
}, 1000);

function updMsg(msg){
  if (imgs){
    if (msg.querySelector("a")){
      addImage(msg);
    }
  }
  if (pings){
    if (!(`${msg.classList}`.includes('pinged'))){
      msg.classList.add('pinged');
      playPing();
    }
  }
  if (replies){
    if ((!`${msg.classList}`.includes("as-replyable"))){
      if (!msg.innerText.includes('⠀')){
        msg.innerHTML+=`
        <button class="as-replybutton">↪</button>
        `;
        msg.getElementsByClassName('as-replybutton')[0].addEventListener('click', function(){
          document.getElementsByClassName('message-composer')[0].value=`⠀Replying to: ${msg.querySelector('p').textContent} ⠀(${msg.parentElement.parentElement.id.replace('message','')})\n`;
          document.getElementsByClassName('message-composer')[0].focus();
        });
      }
      msg.classList.add('as-replyable');
    }
  }
  if (msg.children[0].innerText.includes('⠀')){
    t=msg.innerText.split('\n');
    if (t[0].includes('⠀')){
      tt=t[0];
      i=tt.lastIndexOf('⠀(');
      if (i==-1){
        // using old replies
        vv=msg.innerHTML.split('<br>');
        v=msg.innerHTML.replace(vv[0],'');
        msg.innerHTML=`
        <p>
          <span style="font-style: italic; background-color: rgba(0,0,0,0.1); cursor: pointer;">↪ ${tt.replace('⠀Replying to: ','')}</span>
          <br>
          <p>${v}
        </p>`;
        msg.innerHTML.replaceAll('⠀','');
      }else{
        // using new replies
        vv=msg.innerHTML.split('<br>');
        v=msg.innerHTML.replace(vv[0],'');
        id=tt.substring(tt.lastIndexOf('⠀(')+2,tt.length-1);
        tt=tt.replace('⠀Replying to: ','')
        tt=tt.substring(0,tt.lastIndexOf('⠀('));
        msg.innerHTML=`
        <p>
          <span style="font-style: italic; background-color: rgba(0,0,0,0.1); cursor: pointer;">↪ ${tt}</span>
          <br>
          <p>${v}
        </p>`;
        msg.innerHTML.replaceAll('⠀','');
        msg.querySelector('span').addEventListener('click', function(){
          elm=document.getElementById(`message${id}`);
          if (typeof elm !== 'undefined') {
            elm.scrollIntoView({ behavior: 'smooth' });
          }else{
            alert(`This message can't be found!`);
          }
        });
      }
    }
  }
}

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
}))


function getImage(url) {
  return new Promise((resolve) => {
    url = url.split('?')[0];
    var parts = url.split('.');
    var extension = parts[parts.length-1];
    var imageTypes = ['jpg','jpeg','tiff','png','gif','bmp','webp'];
    if(imageTypes.indexOf(extension) !== -1) {
      toDataURL(url)
      .then(dataUrl => {
        resolve(dataUrl);
      })
    }else{
      resolve(false);
    }
  });
}

async function addImage(msg){
  var a = msg.querySelector('a');
  img = await getImage(a.href);
  if ((!msg.querySelector("img")) && img != false){
    msg.innerHTML=`<img title="${img} - Provided by Astralsparv" style="max-width: 70%; float: right; padding-bottom: 2%;" src="${img}">`;
  }
}

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {

        if (node.classList?.contains('message')) {
          update();
        } else if (node.querySelector?.('.message')) {
          update();
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


update();

const style = document.createElement('style');
style.textContent = `
/* ASTRALSPARV SPACEHEY TWEAKS STYLING */
.as-replybutton{
  display: none;
}
.message:hover .as-replybutton{
  border: none;
  background-color:rgb(255, 255, 255);
  font-weight: bold;
  position: absolute;
  bottom:-20%;
  right:0;
  cursor:alias;
  display: block;
}
`;

document.head.appendChild(style);