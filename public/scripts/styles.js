

//image preview

function previewMultiple(event) {
    let images = document.getElementById("image");
    let number = images.files.length;
    for (let i = 0; i < number; i++) {
        let urls = URL.createObjectURL(event.target.files[i]);
        document.getElementById("formFile").innerHTML += '<img src="' + urls + '">';
    }
}

bsCustomFileInput.init()


//autohide navbar
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-60px";
  }
  prevScrollpos = currentScrollPos;
} 