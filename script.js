let currentPage = 1, perPage = 6;
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// login admin
function login() {
  if (document.getElementById("user").value === "admin" && document.getElementById("pass").value === "admin") {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    manageProducts();
  } else alert("รหัสผิด");
}

// add product
function addProduct(e) {
  e.preventDefault();
  let list = JSON.parse(localStorage.getItem("products") || "[]");
  let imgFile = document.getElementById("pimg")?.files[0];
  if (imgFile) {
    let reader = new FileReader();
    reader.onload = ev => saveProduct(list, ev.target.result);
    reader.readAsDataURL(imgFile);
  } else saveProduct(list, "");
}
function saveProduct(list, img) {
  let p = {
    name: document.getElementById("pname").value,
    desc: document.getElementById("pdesc").value,
    logo: img,
    price: parseInt(document.getElementById("pprice").value),
    sale: parseInt(document.getElementById("psale").value) || 0,
    cat: document.getElementById("pcat").value,
    stock: parseInt(document.getElementById("pstock").value) || 0
  };
  list.push(p);
  localStorage.setItem("products", JSON.stringify(list));
  alert("เพิ่มสินค้าแล้ว");
  manageProducts();
  loadProducts();
}
function manageProducts() {
  let list = JSON.parse(localStorage.getItem("products") || "[]");
  let box = document.getElementById("manage"); if (!box) return;
  box.innerHTML = "";
  list.forEach((p, i) => {
    box.innerHTML += `<div>${p.name} - สต๊อก ${p.stock} <button onclick="delProduct(${i})">ลบ</button></div>`;
  });
}
function delProduct(i) {
  let list = JSON.parse(localStorage.getItem("products") || "[]");
  list.splice(i,1);
  localStorage.setItem("products", JSON.stringify(list));
  manageProducts();
  loadProducts();
}

// load products
function loadProducts() {
  let list = JSON.parse(localStorage.getItem("products") || "[]");
  let box = document.getElementById("product-list"); if (!box) return;
  let search = document.getElementById("search")?.value.toLowerCase() || "";
  let filter = document.getElementById("filter")?.value || "";
  let stock = document.getElementById("stockFilter")?.value || "";
  let sort = document.getElementById("priceSort")?.value || "";

  let filtered = list.filter(p=>{
    if (search && !p.name.toLowerCase().includes(search)) return false;
    if (filter && p.cat !== filter) return false;
    if (stock==="in" && p.stock<=0) return false;
    if (stock==="out" && p.stock>0) return false;
    return true;
  });
  if (sort==="asc") filtered.sort((a,b)=>a.price-b.price);
  if (sort==="desc") filtered.sort((a,b)=>b.price-a.price);
  if (sort==="new") filtered = filtered.reverse();

  let totalPage = Math.ceil(filtered.length/perPage);
  let start=(currentPage-1)*perPage, end=start+perPage;
  let pageItems=filtered.slice(start,end);

  box.innerHTML="";
  pageItems.forEach(p=>{
    box.innerHTML+=`
      <div class="product">
        <span class="cat-label">${p.cat||"ทั่วไป"}</span>
        <img src="${p.logo||''}" alt="">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="price">
          ${p.sale?`<del>${p.price}฿</del> <b>${p.sale}฿</b>`:`<b>${p.price}฿</b>`}
        </div>
        <p style="margin:0 12px 12px;color:#2563eb;">คงเหลือ: ${p.stock}</p>
        <button class="buy-btn" onclick="buyMsg()">สั่งซื้อ</button>
        <button class="quick-add" onclick="quickAdd()">+1</button>
        <button class="wishlist-btn ${wishlist.includes(p.name)?'active':''}" onclick="toggleWishlist('${p.name}')">♡ Favorite</button>
      </div>`;
  });
}

// functions
function buyMsg(){ alert("ระบบสั่งซื้อยังไม่เสร็จ ติดต่อ Facebook ได้เลย"); }
function quickAdd(){ alert("เพิ่มสินค้าเข้าตะกร้าแล้ว (จำลอง)"); }
function toggleWishlist(n){
  if(wishlist.includes(n)) wishlist=wishlist.filter(x=>x!==n);
  else wishlist.push(n);
  localStorage.setItem("wishlist",JSON.stringify(wishlist));
  loadProducts();
}
function randomizePrices(){
  let list = JSON.parse(localStorage.getItem("products")||"[]");
  let changed=false;
  list=list.map(p=>{
    let change=Math.floor(Math.random()*3)-1;
    if(change!==0){ p.price=Math.max(1,p.price+change); changed=true; }
    if(p.sale){ let sc=Math.floor(Math.random()*3)-1;
      if(sc!==0){ p.sale=Math.max(1,p.sale+sc); changed=true; }
    }
    return p;
  });
  if(changed){ localStorage.setItem("products",JSON.stringify(list)); loadProducts(); }
}
setInterval(randomizePrices,10000);
window.onload=loadProducts;
