const availablePings=[

]

let blocked=[];

chrome.storage.sync.get(['blocked'], (settings) => {
  if (settings.blocked) {
    blocked=settings.blocked;
  }
});

console.log('Lexaloffle BBS Enhancements is running.\nDeveloped by Astralsparv https://www.lexaloffle.com/bbs/?uid=97099\nNo affiliation with Lexaloffle.');

function block(uid){
  if (!(blocked.includes(uid))){
    blocked.push(uid);
  }
  chrome.storage.sync.set({blocked: blocked},()=>{
    console.log(`${uid} blocked`)
  });
}
function unblock(uid){
  const index = blocked.indexOf(uid);
  if (index !== -1) {
    blocked.splice(index, 1);
    chrome.storage.sync.set({blocked: blocked},()=>{
      console.log(`${uid} unblocked`)
    });
  }
}

function updBBSComment(comment,updblock){
  if (!updblock){
    if (comment.classList.contains("bbsenhancements-processed")) return;
  }
  comment.classList.add("bbsenhancements-processed");
  const userLink = comment.querySelector('a[href*="?uid="]');
  if (!userLink) return;
  const uid = userLink.href.split("?uid=")[1].split("#")[0];

  const thisuserblocked = blocked.includes(uid);

  if (thisuserblocked && !comment.querySelector('#bbsenhancements-blockwarning')){
    const children = comment.children;
    for (let k=0; k<children.length; k++){
      children[k].classList.add("bbsenhancements-clicktounhide");
    }

    const warning = document.createElement('p');
    warning.id = "bbsenhancements-blockwarning";
    warning.textContent = "This user is blocked. Click to view";
    comment.appendChild(warning);
    comment.classList.add("bbsenhancements-blockedthread");

    comment.addEventListener("click", function(){
      if (this.classList.contains("bbsenhancements-blockedthread")){
        const hiddenElements = this.querySelectorAll("*:not(#bbsenhancements-blockwarning):not(.bbsenhancements-blockbutton)");
        hiddenElements.forEach(el => el.classList.remove("bbsenhancements-clicktounhide"));
        this.classList.remove("bbsenhancements-blockedthread");
        this.querySelector('#bbsenhancements-blockwarning')?.remove();
      }
    });
  }

  if (!updblock){
    // add the block button
    const buttonContainer = comment.querySelector("div[style*='display:flex'][style*='float:right']");
    if (buttonContainer && !buttonContainer.querySelector('.bbsenhancements-blockbutton')){
      const btn=document.createElement('button');
      btn.className="bbsenhancements-blockbutton";
      btn.uid=uid;
      btn.textContent = thisuserblocked ? "Unblock" : "Block";
      buttonContainer.appendChild(btn);

      btn.addEventListener("click", function(e){
        if (blocked.includes(this.uid)){
          unblock(this.uid);
          this.textContent="Block";
        } else {
          block(this.uid);
          this.textContent="Unblock";
        }
        setTimeout(() => {
          update(0,this.uid);
        }, 10);
      });
    }
  }
}

function updBBSThread(thread,updblock){
  if (!updblock){
    if (thread.classList.contains("bbsenhancements-processed")){ return; }
  }
  thread.classList.add("bbsenhancements-processed");
  
  let thisuserblocked=false;
  let uid;

  let links=thread.getElementsByTagName('a');
  for (let i=0; i<links.length; i++){
    let index=links[i].href.indexOf(`?uid=`);
    if (index!=-1){
      uid=links[i].href.substring(index+5);
      let end=uid.indexOf("#");
      if (end!=-1){
        uid=uid.substring(0,end);
      }
    }
    if (uid){
      if (blocked.includes(uid)){
        thisuserblocked=true;
        let children=thread.children;
        for (let k=0; k<children.length; k++){
          children[k].classList.add("bbsenhancements-clicktounhide");
        }
        thread.classList.add("bbsenhancements-blockedthread");
        thread.addEventListener("click",function(){
          if (this.classList.contains("bbsenhancements-blockedthread")){
            let children=this.children;
            for (let i=0; i<children.length; i++){
              children[i].classList.remove("bbsenhancements-clicktounhide");
            }
            this.classList.remove("bbsenhancements-blockedthread");
            this.querySelector('#bbsenhancements-blockwarning').remove();
          }
        });
      }
      break;
    }
  }
  if (thisuserblocked){
      let elm=document.createElement('p');
      elm.id="bbsenhancements-blockwarning";
      elm.textContent="This user is blocked. Click to view";
      thread.appendChild(elm);
  }
  
  if (!updblock){
    // add the block button
    const buttonContainer = thread.querySelector("div[style*='min-width:160px'][style*='display:flex']");
    if (buttonContainer){
      let elm=document.createElement('button');
      if (thisuserblocked){
        elm.textContent="Unblock";
      }else{
        elm.textContent="Block";
      }
      elm.classList="bbsenhancements-blockbutton";
      elm.uid=uid;
      elm.thread=thread;
      
      buttonContainer.appendChild(elm);

      elm.addEventListener("click",function(){
        if (blocked.includes(this.uid)){
          unblock(this.uid);
          this.textContent="Block";
          setTimeout(() => {
            update(0,this.uid);
          }, 10);
        }else{
          block(this.uid);
          this.textContent="Unblock";
          setTimeout(() => {
            update(0,this.uid);
          }, 10);
        }
      });
    };
  }
}

function update(delay,uid){
  let bbsthreads;
  if (delay==null) {delay=1000};
  bbsthreads = document.getElementsByClassName('thread_preview');
  const comments = document.querySelectorAll("div[id^='p']:not(.thread_preview)");
  // find a non race-condition way
  setTimeout(() => {
    for (let i=0; i<bbsthreads.length; i++){
      if (uid){
        updBBSThread(bbsthreads[i],uid);
      }else{
        updBBSThread(bbsthreads[i]);
      }
    }
    for (let i=0; i<comments.length; i++){
      if (uid){
        updBBSComment(comments[i],uid);
      }else{
        updBBSComment(comments[i]);
      }
    }
    firstLoad=true;
  }, delay);
}

firstLoad=false;

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
}))

update();

const style=document.createElement('style');
style.textContent=`
/* bbs enhancements */

.bbsenhancements-blockedthread{
  cursor: pointer;
}
.bbsenhancements-clicktounhide{
  display: none !important;
}

.bbsenhancements-blockbutton{
  display:flex; background:#555; padding:6px;
  align-items: center; cursor:pointer; margin-left:12px;
  font-family: proggyvec;
  color: #fff !important;
}
`;

document.head.appendChild(style);