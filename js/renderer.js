var net = net || {};
net.ntxt = net.ntxt || {};
net.ntxt.expressions = net.ntxt.expressions || {};
net.ntxt.expressions.renderer = (function render(){
  var rendererAPI = {
        render  : render,
        context : context
    },
    _context;
    
    function render($container, expression){
          var maxRecursionLevel = 5;
            renderRecursively($container, expression, maxRecursionLevel);
    };
    
    function context(){
        if(arguments.length > 0){
            _context = arguments[0];
            return rendererAPI;
        }else{
            return _context;
        }
    };
    
    function renderRecursively($container, expression, level){
        if(level < 0) throw "Recursion too deep";
        
        express
        
    };
    
    return rendererAPI;
});