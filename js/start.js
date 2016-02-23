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
context.addRenderers(net.ntxt.expressions.renderers.html());
context.addRenderers(net.ntxt.expressions.renderers.plaintext());

function parseExpr(data){
    try{
        var e = context.fromJsonStruct(data);
        var cfg = {amount:21, name:'Olaboga'};
        var result = context.context(cfg).evaluate(e);
        var view1 = context.render(e, 'html');
        var view2 = context.render(e, 'plaintext');
        $('.evalResult').html(result ? "true" : "false");
        $('.view1').html(view1);
        $('.view2').html(view2);
        $('.expression').mouseenter(showContextMenu);
    }catch(e){
        $('.error').html(e);
    }
}

function showContextMenu(){
    var pos = $(this).offset();
    $('.contextMenu').animate({left:pos.left + $(this).width(), top:pos.top});
}