
var expAPI = net.ntxt.expressions.context();
expAPI.addRenderers(net.ntxt.expressions.renderers.html());
expAPI.addRenderers(net.ntxt.expressions.renderers.plaintext());
expAPI.addRenderers(net.ntxt.expressions.renderers.english());
var rules;


$(document).ready(function(){
  $.getJSON('./json/exp1.json')
  .done(function(data){
		$("#json").text(JSON.stringify(data,null,2));
        parseExpr(data);
    })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log( "error: " + errorThrown);
  });
  
  $('input').change(evaluate).change(render);

    
});



function parseExpr(data){
    try{
        rules = expAPI.fromJsonStruct(data);
		evaluate();
		render();
        $('.expression').mouseenter(showContextMenu);
        
    }catch(e){
        $('.error').html(e + '<br/>file: ' + e.fileName + '<br/>line: ' + e.lineNumber);
    }
}
function render(){
	//expAPI.context(getInput());
    var view1 = expAPI.render(rules, 'html', getInput());
	var view2 = expAPI.render(rules, 'plaintext');
	var view3 = expAPI.render(rules, 'english');
	$('.view1').html(view1);
	$('.view2').html(view2);
	$('.view3').html(view3);
}

function evaluate(){
	var entity = getInput();
	var result = expAPI.evaluate(rules, entity);
    $('.evalInput').removeClass("false true").addClass(result ? "true" : "false");
}

function showContextMenu(){
    var pos = $(this).offset();
    $('.contextMenu').animate({left:pos.left + $(this).width(), top:pos.top});
}

function getInput(){
	var amount = $('input[name=amount]').val();
	var name = $('input[name=name]').val();
	return {amount:parseInt(amount), name:name};
}