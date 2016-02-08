$(document).ready(function(){
  $.getJSON('./json/exp1.json')
  .done(function(data){
		parseExpr(data);
	})
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log( "error: " + errorThrown);
  });
	
	
});

var context = net.ntxt.expressions.context();

function parseExpr(data){
	try{
		var e = context.fromJsonStruct(data);
		var entity = {amount:21, name:'Olaboga'};
		var result = context.entity(entity).evaluate(e);
		var view = context.render(e);
		$('.evalResult').html(result ? "true" : "false");
		$('.view').html(view);
		$('.interactive').mouseenter(showContextMenu);
	}catch(e){
		$('.error').html(e);
	}
}

function showContextMenu(){
    var parent = $(this).parent();
	var pos = parent.offset();
    var w = parent.width();
	$('.contextMenu').stop(true).animate({left:pos.left + w + 5, top:pos.top});
}