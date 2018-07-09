
var expAPI = net.ntxt.expressions.context();
expAPI.addRenderers(net.ntxt.expressions.renderers.html());
expAPI.addRenderers(net.ntxt.expressions.renderers.plaintext());
expAPI.addRenderers(net.ntxt.expressions.renderers.english());
var rules;
var formInputTpl = '<span><label>{varName}:</label><input name="{varName}" type="{varType}" value="{varValue}"/></span>';

$(document).ready(function(){
  $.getJSON('./json/exp1.json')
  .done(function(data){
		//$("#json").text(JSON.stringify(data,null,2)).change();
		$("#json").text(stringify(data)).change();
        renderNewExpression(data);
		//render();
    })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log( "error: " + errorThrown);
  });
  
  $('#json')
  	.change(resizeTextBox)
  	.change(function(){
	  try{
		var data = JSON.parse($(this).val());
	  } catch (e){
		alert(e);
	  }
	  renderNewExpression(data);
  });
    
});

function renderNewExpression(exp){
	parseExpr(exp);
	$(".view.input>.form").empty().append(extractInputs());
	render();
}

function extractInputs(){
	var form = $("<form/>"),
		varIndex = {},
	    varExps = []
			.concat(expAPI.search(rules, 'VAR-STRING'))
			.concat(expAPI.search(rules, 'VAR-NUMBER'));
	
	for(var i = 0; i < varExps.length; i++){
		var varName = varExps[i].args[0],
		    varType = expAPI.typeOfExp(varExps[i]),
			inputHtml;
		if(!varIndex[varName]){
			inputHtml = $(populate(formInputTpl, {varName:varName, varType:varType, varValue:''}));
			form.append(inputHtml);
			inputHtml.find('input').change(evaluate).change(render);
			varIndex[varName] = true;
		}
	}		
	return form;
}

function resizeTextBox(){
    this.style.height = this.scrollHeight+'px';
}

function populate(tpl, params){
	var out = tpl;
	for(var name in params){
		var value = htmlEscape(params[name]);
		var regex = new RegExp('\{'+name+'\}', 'g');
		out = out.replace(regex, value);
	}
	return out;
}

function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function parseExpr(data){
    try{
        rules = expAPI.fromJsonStruct(data);
		evaluate();
		render();
        $('.expression').mouseenter(showContextMenu);
        
    }catch(e){
		var msg = e;
		if(e.hasOwnProperty('fileName')) e += '<br/>file: ' + e.fileName + '<br/>line: ' + e.lineNumber;
        $('.error').html(msg);
    }
}
function render(){
	//expAPI.context(getInput());
    var viewHtml = expAPI.render(rules, 'html', getInput());
	var viewMath = expAPI.render(rules, 'plaintext');
	var viewEnglish = expAPI.render(rules, 'english');
	$('.view.html').html(viewHtml);
	$('.view.math p').html(viewMath);
	$('.view.english p').html(viewEnglish);
}

function evaluate(){
	console.log('eval');
	var entity = getInput();
	var result = expAPI.evaluate(rules, entity);
    $('.input').removeClass("false true").addClass(result ? "true" : "false");
}

function showContextMenu(){
    var pos = $(this).offset();
    $('.contextMenu').animate({left:pos.left + $(this).width(), top:pos.top});
}

function getInput(){
	var result = {},
		inputs = $('.view.input form input');
		
	inputs.each(extractDataFromInput);
	
	function extractDataFromInput(){
		var input = $(this),
            type = input.prop("type"),
			name = input.prop("name");
		switch(type){
			case "number":
				result[name] = parseFloat(input.val());
			break;
			case "text":
			default:
				result[name] = input.val();
		}
	}
	return result;
}