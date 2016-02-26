var net = net || {};
net.ntxt = net.ntxt || {};
net.ntxt.expressions = net.ntxt.expressions || {};
net.ntxt.expressions.renderers = net.ntxt.expressions.renderers || {};
net.ntxt.expressions.renderers.plaintext = (function plaintext()
{
    var TARGET = 'plaintext',
        renderers = {
      'VAR-STRING'   : genericVarRenderer,
      'VAR-NUMBER'   : genericVarRenderer,
      'VAR-BOOLEAN'  : genericVarRenderer,
      'VAR-DATE'     : genericVarRenderer,
      'VAL-STRING'   : genericLiteralRenderer,
      'VAL-NUMBER'   : genericLiteralRenderer,    
      'AND'          : genericListRenderer,
      'EQUAL'        : genericBinaryOpRenderer,
      'GREATER'      : genericBinaryOpRenderer,    
      'LESS'         : genericBinaryOpRenderer        
    };
    
  function genericVarRenderer(ex){
        var op = ex.op,
                varName = ex.args[0],
                view = varName;
        return view;
    };
    
    function genericLiteralRenderer(ex, target){
        var self = this,
            op = ex.op,
                varName = ex.args[0],
                view = (self.operators(op).type === 'number') ? varName : '"' + varName + '"';
        return view;
    };
    
    function genericListRenderer(ex, target){
        var self = this,
            op = ex.op,
                view = "( ";
                
        $.each(ex.args, function(i, arg){
            var argView = self.render(arg, target);
            if(i > 0) view += " " + self.operators(op).label + " ";
            view += argView;                                             
        });
        view += " )";
        return view;
  };
    
    function genericBinaryOpRenderer(ex, target){
        var self = this,
            op = ex.op,
                view = "",
                arg1 = ex.args[0],
                arg2 = ex.args[1];
                
        view = self.render(arg1, target) + " " + self.operators(op).label + " " + self.render(arg2, target);
        return view;    
    };
    
    function getRenderer(opName){
        return renderers[opName];
    }
    
    return {
        getRenderer:getRenderer,
        target:TARGET
    };
});