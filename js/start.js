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

var expAPI = net.ntxt.expressions.context();
expAPI.addRenderers(net.ntxt.expressions.renderers.html());
expAPI.addRenderers(net.ntxt.expressions.renderers.plaintext());
var rules;

function parseExpr(data){
    try{
        rules = expAPI.fromJsonStruct(data);
		render();
        $('.expression').mouseenter(showContextMenu);
        evaluate();
    }catch(e){
        $('.error').html(e + '<br/>file: ' + e.fileName + '<br/>line: ' + e.lineNumber);
    }
}
function render(){
	expAPI.context(getInput());
    var view1 = expAPI.render(rules, 'html');
	var view2 = expAPI.render(rules, 'plaintext');
	$('.view1').html(view1);
	$('.view2').html(view2);
}

function evaluate(){
	var entity = getInput();
	var result = expAPI.context(entity).evaluate(rules);
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