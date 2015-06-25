/*

id=Drop/Click DIV Id
target=Uploading Page URL (Local)
maxWidth=Max Width of Resized Image
maxHeight=Max Height of Resized Image
maxFile=Number of File Accept at a time
crop=[true:Image Will Cropped with Actual(maxWidth, maxHeight) size], [false:Image Will Not Cropped, it only limit maxWidth & maxHeight]
multiple=[true:Can Select & Upload Multiple File at a time], [false:Can Select & Upload Only One File at a time]
opInputs=This Values are Goes with Every Image
<div class="imageUpload" id="div5"></div><div id="div5_statusBar" class="statusBar"></div>
craeteImageDropEvent("div5", "upload.php", 600, 600, 20, true, true, "x=y");

*/


window.onerror=function(msg, url, linenumber){
	alert('Error message:\n'+msg+'\nURL: '+url+'\nLine Number: '+linenumber)
}
//--Object/Values Alerter
function alertVar(obj){
	var objLength=0;
	var out="Input Type : "+ typeof obj +"\n";
	if(typeof obj=='number')
	out +="Naumber Value : "+ obj +"\n";
	for(var key in obj){
		var str=obj[key];
		out +=key +" : "+ str +"\n";
		objLength++;
	}
	out +="Length : "+ objLength +"\n";
	alert(out);
}
//--Random Key Generator
function randCode(length){
	var codeStr="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var out="";
	for(i=0; i<length; i++){
		out +=codeStr[Math.round(Math.random()*10000000)%36];
	}
	return out;
}
//--Craeting Drop Area
function allowDrop(ev){
    ev.preventDefault();
}
//--On Droping
function drop(ev, id){
    ev.preventDefault();
	var dt    = ev.dataTransfer;
	var files = dt.files;
	
	collectFiles(document.getElementById(id+'_input'), files);
}
//--Creating Canvas/Thumb One-By-One
function createCanvas(fileNumber){
	if(selectedFiles[fileNumber]){
		file=selectedFiles[fileNumber];
		//--Creating Canvas
		var reader = new FileReader();
		reader.onloadend = function(){
			var tempImg = new Image();
			tempImg.src = reader.result;
			tempImg.onload = function(){
				var tempW = tempImg.width;
				var tempH = tempImg.height;
				if (tempW > tempH) {
					if (tempW > MAX_WIDTH){
						tempH *= MAX_WIDTH / tempW;
						tempW = MAX_WIDTH;
					}
				}
				else {
					if (tempH > MAX_HEIGHT){
						tempW *= MAX_HEIGHT / tempH;
						tempH = MAX_HEIGHT;
					}
				}
				
				var canvas = document.createElement('canvas');
				canvas.width = tempW;
				canvas.height = tempH;
				var ctx = canvas.getContext("2d");
				ctx.drawImage(this, 0, 0, tempW, tempH);
				
				if(file.type == "image/jpeg")
				var dataURL = canvas.toDataURL("image/jpeg");
				else if(file.type == "image/png")
				var dataURL = canvas.toDataURL("image/png");
				else if(file.type == "image/gif")
				var dataURL = canvas.toDataURL("image/gif");
				
				//--Creating Thumb
				if(document.getElementById('canvasDisp_'+file.name))
				document.getElementById('canvasDisp_'+file.name).innerHTML="<img src='"+dataURL+"' id='canvasImgData_"+file.name+"'>";
						
				//--Progress Bar 
				document.getElementById('canvasProg_'+file.name).style.width="100%";
				
				//--Auto Calling Next Canvas onSuccess
				createCanvas(fileNumber+1);
			}
			tempImg.onerror = function(){
				//--Creatng Thumb (Error Message)
				if(document.getElementById('canvasDisp_'+file.name))
				document.getElementById('canvasDisp_'+file.name).innerHTML="Error";
				
				//--Auto Calling Next Canvas onError
				createCanvas(fileNumber+1);
			}
		}
		reader.readAsDataURL(file);
	}
	else{
		//--Canvas Finished
		canvasFinished=true;
	}
}
//--Uploading FIles One-By-One
function uploadingProcess(fileNumber){
	file=selectedFiles[fileNumber];
	nowUploadFileSize=0;
	
	if(!selectedFiles[fileNumber]){
		uploadFinished=true;
		//alert("Upload Finished");
	}
	else if(fnCanvasStatus(file.name)!="Success"){ //--Canvas Error
		//--On Canvas Error Call Next File
		uploadingProcess(fileNumber+1);
	}
	else{
		nowUploadFileName=file.name;
		totalFilesizeCanvased=document.getElementById('canvasImgData_'+file.name).src.length;
		
		//--Main Uploading Process By AJAX
		var xhr = new XMLHttpRequest();
		if(xhr.upload){
			xhr.upload.onprogress=function(e){
				nowUploadFileSize=e.loaded;
						
				//--Progress Bar 
				if(document.getElementById('canvasUpload_'+file.name))
				document.getElementById('canvasUpload_'+file.name).style.width=Math.round(nowUploadFileSize*100/totalFilesizeCanvased)+"%";
			}
			
			//--File Ready To Upload
			xhr.onreadystatechange = function(e){
				if (xhr.readyState == 4) {
					if(xhr.status == 200){		//xhr.responseText
						fileUploadSuccessObj[fileNumber]=file.name;
						
						if(xhr.responseText!="OK")
						alert(xhr.responseText);
					}
					else{
						alert("Target Page Not Found. /"+xhr.status);
						
						//--File Uploading Failed
						fileUploadFailedObj[fileNumber]=file.name;
						
						
						//--Progress Bar 
						if(document.getElementById('canvasUpload_'+file.name))
						document.getElementById('canvasUpload_'+file.name).style.backgroundColor="#F00";
					}
					
					//Calling Next File
					uploadingProcess(fileNumber+1);
				}
			}
			
			xhr.open('POST', targetUrl, true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			var data = 'fileName='+file.name+'&'+opInputs+'&imageData='+document.getElementById("canvasImgData_"+file.name).src;
			xhr.send(data);
		}
	}
}
function fnTotalFile(){
	return selectedFiles.length;
}
function fnTotalFilesize(selectedFiles){
	var totalFilesize=0;
	if(selectedFiles.length)
	for(var i=0; i<selectedFiles.length; i++){
		for(var key in selectedFiles[i]){
			if(key=="size")
			totalFilesize +=selectedFiles[i][key];
		}
	}
	return totalFilesize;
}
function fnTotalCanvas(){
	var totalCanvas=0;
	if(selectedFiles.length)
	for(var key in selectedFiles){
		if(document.getElementById("canvasImgData_"+selectedFiles[key]['name']))
		totalCanvas++;
		
		if(document.getElementById("canvasDisp_"+selectedFiles[key]['name']) && document.getElementById("canvasDisp_"+selectedFiles[key]['name']).innerHTML=="Error")
		totalCanvas++;
		
	}
	return totalCanvas;
}
function fnTotalCanvasSuccess(){
	var totalCanvas=0;
	if(selectedFiles.length)
	for(var key in selectedFiles){
		if(document.getElementById("canvasImgData_"+selectedFiles[key]['name']))
		totalCanvas++;
	}
	return totalCanvas;
}
function fnTotalCanvasFailed(){
	var totalCanvas=0;
	if(selectedFiles.length)
	for(var key in selectedFiles){
		if(document.getElementById("canvasDisp_"+selectedFiles[key]['name']) && document.getElementById("canvasDisp_"+selectedFiles[key]['name']).innerHTML=="Error")
		totalCanvas++;
	}
	return totalCanvas;
}
function fnTotalCanvasSize(){
	var totalCanvasSize=0;
	if(selectedFiles.length)
	for(var key in selectedFiles){
		if(document.getElementById("canvasImgData_"+selectedFiles[key]['name']))
		totalCanvasSize +=document.getElementById("canvasImgData_"+selectedFiles[key]['name']).src.length;
	}
	return totalCanvasSize;
}
function fnNowCanvasFileName(){
	return nowCanvasFileName;
}
function fnNowCanvasFileSize(){
	return nowCanvasFileSize;
}
function fnCanvasStatus(fileName){
	if(document.getElementById('canvasImgData_'+fileName))
	return "Success";
	else if(document.getElementById('canvasDisp_'+fileName) && document.getElementById('canvasDisp_'+fileName).innerHTML=="Error")
	return "Error";
	else
	return false;
}
function fnTotalUpload(){
	return fnTotalUploadSuccess()+fnTotalUploadFailed();
}
function fnTotalUploadSuccess(){
	return fileUploadSuccessObj.length;
}
function fnTotalUploadFailed(){
	return fileUploadFailedObj.length;
}
function fnTotalUploadSize(){
	var totalUploadSize=0;
	if(selectedFiles.length)
	for(var key in selectedFiles){
		if(fileUploadSuccessObj.indexOf(selectedFiles[key]['name'])!=-1)
		totalUploadSize +=document.getElementById("canvasImgData_"+selectedFiles[key]['name']).src.length;
	}
	return totalUploadSize+fnNowUploadFileSize();
}
function fnNowUploadFileName(){
	return nowUploadFileName;
}
function fnNowUploadFileSize(){
	return nowUploadFileSize;
}

function craeteImageDropEvent(id, target, maxWidth, maxHeight, maxFile, crop, multiple, opInputs){
	var newObj=document.createElement('input');
	newObj.setAttribute("type", "file");
	newObj.setAttribute("name", id+"_name");
	newObj.setAttribute("accept", "image/jpeg,image/png,image/gif");
	newObj.setAttribute("id", id+"_input");
	
	if(target)
	newObj.setAttribute("targetUrl", target);
	
	if(maxWidth)
	newObj.setAttribute("maxWidth", maxWidth);
	
	if(maxHeight)
	newObj.setAttribute("maxHeight", maxHeight);
	
	if(maxFile)
	newObj.setAttribute("maxFile", maxFile);
	
	if(crop)
	newObj.setAttribute("crop", crop);
	
	if(multiple)
	newObj.setAttribute("multiple", "multiple");
	
	if(opInputs)
	newObj.setAttribute("opInputs", opInputs);
	
	newObj.setAttribute("onchange", "collectFiles(this, files);");
	newObj.setAttribute("style", "display:none;");
	
	document.body.appendChild(newObj);
	
	var obj=document.getElementById(id);
	
	obj.setAttribute("ondrop", "drop(event, '"+id+"')");
	obj.setAttribute("ondragover", "allowDrop(event)");
	obj.setAttribute("onclick", "document.getElementById('"+id+"_input').click();");
	
	if(document.getElementById(id+'_statusBar'))
	document.getElementById(id+'_statusBar').innerHTML="<div id='"+id+"_statusCanvas'><div id='"+id+"_statusUpload'>&nbsp;</div></div>";
}

//--Setting
var targetUrl="upload.php";
var MAX_HEIGHT	=1169;	//px
var MAX_WIDTH	=1169;	//px
var MAX_FILE	=100;	//Dont Use More The 100
var opInputs	="bikiran";
var bikCanvasAreaId="div1";
var crop		="false";
var supportedFileTypeObj=['image/jpeg', 'image/png', 'image/gif'];

var selectedFiles;
var nowCanvasFileName="";
var nowCanvasFilesize=0;
var canvasFinished=false;

var nowUploadFileName="";
var nowUploadFileSize=0;
var uploadFinished=false;

var fileUploadSuccessObj=[];
var fileUploadFailedObj=[];

var id="";

//fnTotalFile()
//fnTotalFilesize()
//fnTotalCanvas()
//fnTotalCanvasSuccess()
//fnTotalCanvasFailed()
//fnTotalCanvasSize()
//fnNowCanvasFileName()
//fnNowCanvasFileSize()
//fnCanvasStatus('fileName')

//fnTotalUploadSuccess()
//fnTotalUploadFailed()
//fnTotalUploadSize()
//fnNowUploadFileName()
//fnNowUploadFileSize()

//###############################COUSTOM FUNCTIONS####################################
//onCanvasStart()
//onCanvasFinish()
//onUploadStart()
//onUploadFinish()


//--STEP-1:Collect & Create Div Files One-By-One
function collectFiles(inputObj, files){	//Multipol Files as Object
	selectedFiles=files;
	
	//--Collect Attribute
	if(inputObj.getAttribute('id'))
	id=inputObj.getAttribute('id').replace("_input", "");
	
	if(inputObj.getAttribute('targetUrl'))
	targetUrl=inputObj.getAttribute('targetUrl');
	
	if(inputObj.getAttribute('maxWidth'))
	MAX_WIDTH=inputObj.getAttribute('maxWidth');
	
	if(inputObj.getAttribute('maxHeight'))
	MAX_HEIGHT=inputObj.getAttribute('maxHeight');
	
	if(inputObj.getAttribute('maxFile'))
	MAX_FILE=inputObj.getAttribute('maxFile');
	
	if(inputObj.getAttribute('opInputs'))
	opInputs=inputObj.getAttribute('opInputs');
	
	if(inputObj.getAttribute('crop'))
	crop=inputObj.getAttribute('crop');
	
	//--Canvas Status Setting
	canvasFinished=false;
	uploadFinished=false;
	
	//--Maximum File Limit
	if(MAX_FILE>100){
		alert("Setting Problem: MAX_FILE >100");
		return false;
	}
	else if(fnTotalFile()>MAX_FILE){
		alert("Your Selected File is More Than "+MAX_FILE);
		return false;
	}

	//--File Create Canvas Div One-By-One
	if(selectedFiles.length && document.getElementById(id))
	for (var i=0; i<selectedFiles.length; i++) {
		var file=selectedFiles[i];
		var newDivObj=document.createElement('div');
		newDivObj.setAttribute('id', 'bikCanvas_'+file.name);
		newDivObj.setAttribute('class', 'bikCanvas');
		document.getElementById(id).appendChild(newDivObj);
		document.getElementById('bikCanvas_'+file.name).innerHTML="<div class='canvasFileName' id='canvasFileName_"+file.name+"'>"+file.name+"</div><div class='canvasDisp' id='canvasDisp_"+file.name+"'>&nbsp;</div><div class='canvasStatus' id='canvasStatus_"+file.name+"'><div class='canvasProg' id='canvasProg_"+file.name+"'><div class='canvasUpload' id='canvasUpload_"+file.name+"'>&nbsp;</div></div></div>";
	}

	//--Create Canvas
	if(selectedFiles.length && document.getElementById(id))
	createCanvas(0);
	
	//--Checking Canvas Status;
	checkCanvasStatus();
}


//--STEP-2:Creating Canvas
function checkCanvasStatus(){
	var tVar=setTimeout(function(){checkCanvasStatus()}, 100);
	if(fnTotalCanvas() && fnTotalCanvas()==fnTotalFile()){
		clearTimeout(tVar);
		uploadingProcess(0);		//Uploading Action		
		checkUploadingStatus();
	}
	
	//--Change Canvas Status
	if(document.getElementById(id+'_statusCanvas') && fnTotalCanvas())
	document.getElementById(id+'_statusCanvas').style.width=Math.round(fnTotalCanvasSuccess()*100/fnTotalFile())+"%";

}


//STEP-3:Uploading Canvas
function checkUploadingStatus(){
	var t=setTimeout("checkUploadingStatus()", 1000);
	if(fnTotalCanvas() && fnTotalUpload()==fnTotalCanvas()){
		clearTimeout(t);
	
		//--On Ending Upload
		if(document.getElementById('imgMng'))
		buildPop('imgMng', 'fileManage/files.php', '');
	}
	//--Change Uploading Status
	if(document.getElementById(id+'_statusUpload') && fnTotalCanvas())
	document.getElementById(id+'_statusUpload').style.width=Math.round(fnTotalUploadSize()*100/fnTotalCanvasSize())+"%";
		
	nowUploadFileName="";
	nowUploadFileSize=0;
	uploadFinished=false;
	
	fileUploadSuccessObj=[];
	fileUploadFailedObj=[];
}

