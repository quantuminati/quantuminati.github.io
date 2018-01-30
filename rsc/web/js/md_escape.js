(function(){
	var box = document.createElement("div");
	var raw = document.createElement("textarea");
	var escaped = document.createElement("textarea");
	var btn = document.createElement("button");
	var elements = [raw, escaped, btn];
	for (var i=0;i<elements.length;i++) box.append(elements[i]);
	for (var i=0;i<2;i++) {
		elements[i].setAttribute("rows","10");
		elements[i].setAttribute("cols","80");
	}
	btn.innerText = "Close Me";
	function closeMe () { box.parentNode.removeChild(box); }
	btn.onclick = closeMe;
	function convertText () {
		escaped.value = raw.value.replace(/([\\`\*_{}\[\]\(\)#\+\-\.\!])/g, "\\$1");
	}
	raw.onpaste = function () { setTimeout(convertText, 250)};
	if (document.body.firstChild) document.body.insertBefore(box, document.body.firstChild);
	else document.body.appendChild(bopx);
})();
